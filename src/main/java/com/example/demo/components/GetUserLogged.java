package com.example.demo.components;

import com.example.demo.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class GetUserLogged {

    public User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User selectedUser) {
            if(!selectedUser.isActive()) {
                return null;
            }
                return (User) authentication.getPrincipal();
        }
        return null;
    }

}
