package com.example.myproject.util;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class SessionUtil {

    private SessionUtil() {}

    public static Long requireUserId(HttpSession session) {
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }
        if (userId instanceof Long id) {
            return id;
        }
        if (userId instanceof Integer id) {
            return id.longValue();
        }
        if (userId instanceof Number num) {
            return num.longValue();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session.");
    }

    public static String getUsername(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object username = session.getAttribute("username");
        return username != null ? username.toString() : null;
    }
}
