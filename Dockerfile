# ===============================
# Run the pre-built application
# ===============================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the pre-built JAR from the root directory
COPY app.jar app.jar

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
