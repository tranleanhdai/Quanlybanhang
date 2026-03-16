package com.example.demo.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INVALID_KEY(1000, "error.invalid_key", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(1001, "error.invalid_username", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1002, "error.invalid_password", HttpStatus.BAD_REQUEST),
    INVALID_NAME_ROLE(1003, "error.invalid_name_role", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1004, "error.user_existed", HttpStatus.CONFLICT),
    USER_IS_NOT_AUTHENTICATE(1014, "User is not authenticate", HttpStatus.NOT_FOUND),
    USER_IS_LOCKED(1015, "error.user_is_locked", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED(1005, "error.user_not_existed", HttpStatus.NOT_FOUND),
    INVALID_USERNAME_OR_PASSWORD(1006, "error.invalid_username_or_password", HttpStatus.BAD_REQUEST),
    INVALID_NAME_PARAM(1007, "error.invalid_name_param", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR(1008, "error.internal_server_error", HttpStatus.INTERNAL_SERVER_ERROR),
    COMMENT_ERROR(1009, "error.comment_error", HttpStatus.BAD_REQUEST),
    INVALID_RETYPE_PASSWORD(1010, "error.invalid_retype_password", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1011, "error.invalid_email", HttpStatus.BAD_REQUEST),
    INVALID_PHONE_NUMBER(1012, "error.invalid_phone_number", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(1013, "Invalid file type", HttpStatus.BAD_REQUEST),
    INVALID_CONVERSATION(1014, "Sender and receiver cannot be the same", HttpStatus.BAD_REQUEST),

    STEP_MEDIA_NOT_FOUND(7795, "Not found step media", HttpStatus.BAD_REQUEST),
    BLANK_CONTENT(7808, "Content cannot be blank", HttpStatus.BAD_REQUEST),

    EXPIRATION_TOKEN(9990, "Token expired !", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(9991, "Token invalid !", HttpStatus.REQUEST_TIMEOUT),
    UNAUTHORIZED(9992, "User is not permitted !", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(9993, "Unauthenticated error !", HttpStatus.UNAUTHORIZED),

    NO_UPDATE_IMAGE_FILE(7999, "Image file don't update success", HttpStatus.BAD_REQUEST),
    BIG_SIZE_IMAGE_FILE(8000, "Image file size exceeds the allowed limit of 10MB!", HttpStatus.BAD_REQUEST),
    REQUIRED_IMAGE_FILE(8001, "Image file is required!", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(9001, "Don't found user!", HttpStatus.BAD_REQUEST),
    NO_UPLOAD_FILE(9002, "Don't upload file!", HttpStatus.BAD_REQUEST),
    NO_FILE(9003, "No file!", HttpStatus.BAD_REQUEST),
    CART_NOT_FOUND(9004, "Cart not found!", HttpStatus.BAD_REQUEST),
    CATALOG_NOT_FOUND(9005, "Catalog not found!", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(9006, "Category not found!", HttpStatus.BAD_REQUEST),
    DETAIL_CART_NOT_FOUND(9007, "DetailCart not found!", HttpStatus.BAD_REQUEST),
    DETAIL_ORDER_NOT_FOUND(9008, "DetailOrder not found!", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_FOUND(9009, "Image not found!", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(9010, "Order not found!", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(9011, "Payment not found!", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(9012, "Product not found!", HttpStatus.BAD_REQUEST),
    RATING_NOT_FOUND(9013, "Rating not found!", HttpStatus.BAD_REQUEST),

    // ⭐ Thêm mới cho chuẩn PDF-import
    INVALID_REQUEST(9014, "Invalid request data", HttpStatus.BAD_REQUEST),

    INVALID_PARAM(9015, "Invalid parameter", HttpStatus.BAD_REQUEST),

    NO_CORRECT_PASSWORD(7997, "Don't correct password", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatusCode;
    }
}
