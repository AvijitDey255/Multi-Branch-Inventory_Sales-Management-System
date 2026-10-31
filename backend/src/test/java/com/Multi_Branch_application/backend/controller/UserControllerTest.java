package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.UserDetailsImpl;
import com.Multi_Branch_application.backend.dto.UserResponse;
import com.Multi_Branch_application.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserDetailsImpl mockUserDetails;

    @BeforeEach
    void setUp() {
        mockUserDetails = new UserDetailsImpl(
                1L,
                "testuser",
                "Test User",
                "test@example.com",
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void testGetMe_Success() {
        UserResponse responseDto = new UserResponse(
                1L,
                "testuser",
                "Test User",
                "test@example.com",
                "USER"
        );

        doReturn(ResponseEntity.ok(responseDto)).when(userService).getUserProfile(mockUserDetails);

        ResponseEntity<?> response = userController.getMe(mockUserDetails);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseDto, response.getBody());
        verify(userService, times(1)).getUserProfile(mockUserDetails);
    }

    @Test
    void testGetMe_Unauthenticated() {
        ResponseEntity<?> response = userController.getMe(null);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(userService, never()).getUserProfile(any());
    }

    @Test
    void testGetAllUsers() {
        UserResponse user1 = new UserResponse(1L, "user1", "User One", "user1@example.com", "USER");
        UserResponse user2 = new UserResponse(2L, "admin", "Admin User", "admin@example.com", "ADMIN");

        when(userService.getAllUsers()).thenReturn(List.of(user1, user2));

        List<UserResponse> result = userController.getAllUsers();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("user1", result.get(0).getUsername());
        assertEquals("admin", result.get(1).getUsername());
        verify(userService, times(1)).getAllUsers();
    }

    @Test
    void testGetUserById_Found() {
        UserResponse user = new UserResponse(1L, "user1", "User One", "user1@example.com", "USER");
        doReturn(ResponseEntity.ok(user)).when(userService).getUserById(1L);

        ResponseEntity<?> response = userController.getUserById(1L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(user, response.getBody());
        verify(userService, times(1)).getUserById(1L);
    }
}
