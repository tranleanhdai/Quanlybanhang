package com.example.demo.services.user;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.components.JwtTokenUtils;
import com.example.demo.entity.Role;
import com.example.demo.entity.Token;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.DataNotFoundException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.exceptions.ExpiredTokenException;
import com.example.demo.models.dtos.userDTO;
import com.example.demo.models.dtos.userLoginDTO;
import com.example.demo.repositories.tokenRepository;
import com.example.demo.repositories.userRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class userServiceIpm implements userService {
    private final Cloudinary cloudinary;
    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtils jwtTokenUtils;
    private final tokenRepository tokenRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public User getUserByEmail(String email) throws Exception {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public User createUser(userDTO dto) {
        if (!dto.getPassword().equals(dto.getRetypePassword())) {
            throw new AppException(ErrorCode.NO_CORRECT_PASSWORD);
        }

        Role role = Role.USER; // default
        if (dto.getRole() != null) {
            try {
                role = Role.valueOf(dto.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_NAME_ROLE);
            }
        }
        // 4. Hash password
        String encodedPassword = passwordEncoder.encode(dto.getPassword());


        User user = User.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .password(encodedPassword)
                .birthday(dto.getBirthday())
                .imageURL("https://res.cloudinary.com/dxd2zwvq9/image/upload/v1758703395/uvyhczyapr52nnqq4jdb.jpg")
                .role(role)
                .active(false)
                .build();

        return userRepository.save(user);
    }


    @Override
    public User updateUser(Long id, userDTO dto) {
        return userRepository.findById(id)
                .map(user -> {
                    // 1. Update basic fields
                    user.setName(dto.getName());
                    user.setPhone(dto.getPhone());
                    user.setEmail(dto.getEmail());
                    user.setAddress(dto.getAddress());
                    user.setBirthday(dto.getBirthday());
                    user.setImageURL(dto.getImageURL());

                    // 2. Nếu có password mới → check retype + hash lại
                    if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                        if (!dto.getPassword().equals(dto.getRetypePassword())) {
                            throw new AppException(ErrorCode.NO_CORRECT_PASSWORD);
                        }
                        user.setPassword(passwordEncoder.encode(dto.getPassword()));
                    }

                    // 3. Nếu có role mới
                    if (dto.getRole() != null) {
                        try {
                            user.setRole(Role.valueOf(dto.getRole().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            throw new AppException(ErrorCode.INVALID_NAME_ROLE);
                        }
                    }

                    return userRepository.save(user);
                })
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }


    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        userRepository.deleteById(id);
    }


    @Override
    public String login(userLoginDTO userLoginDTO) throws Exception {
        String identifier = Optional.ofNullable(userLoginDTO.getEmail())
                .orElse(userLoginDTO.getEmail());

        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        Optional<User> optionalUser = userRepository.findByEmail(userLoginDTO.getEmail());

        User user = optionalUser.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));


        if (!user.isActive()) {
            throw new AppException(ErrorCode.USER_IS_NOT_AUTHENTICATE);
        }

        try {
            Role role = Role.valueOf(userLoginDTO.getRole().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new DataNotFoundException(ErrorCode.INVALID_NAME_ROLE.getMessage());
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    identifier, userLoginDTO.getPassword(), user.getAuthorities()));
        }  catch (BadCredentialsException e) { // catch error username or password
            throw new AppException(ErrorCode.INVALID_USERNAME_OR_PASSWORD);
        }
        return jwtTokenUtils.generateToken(user);
    }
    @Override
    public User getUserDetailsFromRefreshToken(String refreshToken) throws Exception {
        Token existingToken = tokenRepository.findByRefreshToken(refreshToken);
        return getUserDetailsFromToken(existingToken.getToken());
    }
    @Override
    public User getUserDetailsFromToken(String token) throws Exception {
        if(jwtTokenUtils.isTokenExpired(token)) {
            throw new ExpiredTokenException("Token is expired");
        }

        // get UserName From Claim Subject
        String subject = jwtTokenUtils.getSubject(token);
        Optional<User> user;
        user = userRepository.findByEmail(subject);
        return user.orElseThrow(() -> new DataNotFoundException("User not found"));
    }

    @Override
    public void changeStatusTrueUser(User user) {
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    public void changeProfileImage(User user, MultipartFile profileImage) throws Exception {
        if (profileImage == null || profileImage.isEmpty()) {
            throw new AppException(ErrorCode.REQUIRED_IMAGE_FILE);
        }

        if (profileImage.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new AppException(ErrorCode. BIG_SIZE_IMAGE_FILE);
        }

        if (!profileImage.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(profileImage.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                user.setImageURL(res.get("secure_url").toString());
            } catch (IOException ex) {
                throw new AppException(ErrorCode.NO_UPDATE_IMAGE_FILE);
            }
        }
        userRepository.save(user);
    }

}
