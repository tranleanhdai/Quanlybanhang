package com.example.demo.utils.otp;

import java.security.SecureRandom;

public class OtpGenerator {
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS;

    private static final SecureRandom random = new SecureRandom();

    public static String generateOtp(int length) {
        StringBuilder sb = new StringBuilder(length);

        // đảm bảo ít nhất 1 chữ hoa, 1 chữ thường, 1 số
        sb.append(UPPER.charAt(random.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(random.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(random.nextInt(DIGITS.length())));

        for (int i = 3; i < length; i++) {
            sb.append(ALL_CHARS.charAt(random.nextInt(ALL_CHARS.length())));
        }

        // Xáo trộn
        char[] chars = sb.toString().toCharArray();
        for (int i = 0; i < chars.length; i++) {
            int j = random.nextInt(chars.length);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        return new String(chars);
    }
}
