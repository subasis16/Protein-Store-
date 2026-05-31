# ===============================
# Stage 1: Build the application
# ===============================
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first (for dependency caching)
COPY server/mvnw server/mvnw
COPY server/.mvn server/.mvn
COPY server/pom.xml server/pom.xml

# Make Maven wrapper executable
RUN chmod +x server/mvnw

# Download dependencies (cached layer unless pom.xml changes)
RUN cd server && ./mvnw dependency:go-offline -B

# Copy source code
COPY server/src server/src

# Build the JAR (skip tests for faster builds)
RUN cd server && ./mvnw package -DskipTests -B

# ===============================
# Stage 2: Run the application
# ===============================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/server/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Environment variables for external services (override at runtime)
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/fitfuel
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=SERVEROFSUBASIS

ENV SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/fitfuel_catalog
ENV SPRING_DATA_MONGODB_DATABASE=fitfuel_catalog

ENV SPRING_ELASTICSEARCH_URIS=http://elasticsearch:9200

ENV JWT_SECRET=Zml0ZnVlbC1zdXBlci1zZWNyZXQta2V5LWZpdGZ1ZWwtc3VwZXItc2VjcmV0LWtleQ==

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
