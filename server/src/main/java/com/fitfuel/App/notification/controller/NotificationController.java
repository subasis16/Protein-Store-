package com.fitfuel.App.notification.controller;

import com.fitfuel.App.notification.entity.NotificationEntity;
import com.fitfuel.App.notification.repository.NotificationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public List<NotificationEntity> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }
}
