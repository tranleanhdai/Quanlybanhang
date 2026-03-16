package com.example.demo.services.user;

import com.example.demo.entity.User;
import com.example.demo.models.dtos.userDTO;
import com.example.demo.models.dtos.userLoginDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface userService {
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    Optional<User> getUserByPhone(String phone);
    User getUserByEmail(String email) throws Exception;
    User createUser(userDTO userDTO);
    User updateUser(Long id, userDTO userDTO);
    void deleteUser(Long id);
    String login(userLoginDTO userLoginDTO) throws Exception;
    User getUserDetailsFromRefreshToken(String refreshToken) throws Exception;
    User getUserDetailsFromToken(String token) throws Exception;
    void changeStatusTrueUser(User user);
    void changeProfileImage(User user, MultipartFile profileImage) throws Exception;
    void changePassword(User user, String newPassword, String retypePassword);
}
