package com.mohiuddin.HireConnect.Model.Entities;

import jakarta.persistence.*;
import lombok.*;

import javax.management.relation.Role;
import java.lang.reflect.Type;
import java.security.PrivateKey;
import java.security.Timestamp;

@Entity(name = "User")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String location;

    @Column(length = 255)
    private String profileimage;

    @Column(length = 150)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(length = 255)
    private String resumeurl;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean enabled;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", nullable = false)
    private Timestamp updatedAt;

}
