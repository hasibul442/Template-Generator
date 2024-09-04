export function AgencyResponseException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception class for resource not found errors.
 */
@Setter
@Getter
@AllArgsConstructor
public class AgencyResponseException extends RuntimeException {
    private final String code;
    private final String info;

    public static Supplier<AgencyResponseException> supplier(String code, String info) {

        return () -> new AgencyResponseException(code, info);

    }
}
    `;
}

export function ErrorException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception class for resource not found errors.
 */
@Setter
@Getter
public class ErrorException extends Exception {
    private final String code;
    private final String info;

    public ErrorException(String code, String info) {
        this.code = code;
        this.info = info;
    }
}
    `;
}

export function ResourceDuplicationException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception handler for Resource Duplication
 */
@Setter
@Getter
@AllArgsConstructor
public class ResourceDuplicationException extends RuntimeException {
    private final String code;
    private final String info;

    public static Supplier<ResourceDuplicationException> supplier(String code, String info) {
        return () -> new ResourceDuplicationException(code, info);
    }
}
    `;
}

export function ResourceNotFoundException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@RequiredArgsConstructor
public class ResourceNotFoundException extends RuntimeException {

    private final String code;
    private final String info;

    public ResourceNotFoundException(TransactionErrorMessageEnum transactionErrorMessageEnum) {
        this.code = transactionErrorMessageEnum.getErrorCode();
        this.info = transactionErrorMessageEnum.getErrorMessage();
    }

    public static Supplier<ResourceNotFoundException> supplier(String code, String info) {
        return () -> new ResourceNotFoundException(code, info);
    }

}

    `;
}
export function ServiceUnavailableException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception handler for Service Unavailable
 */
@Setter
@Getter
@AllArgsConstructor
public class ServiceUnavailableException extends RuntimeException {

    private final String code;
    private final String info;

    public ServiceUnavailableException(TransactionErrorMessageEnum transactionErrorMessageEnum) {
        this.code = transactionErrorMessageEnum.getErrorCode();
        this.info = transactionErrorMessageEnum.getErrorMessage();
    }

    public static Supplier<ServiceUnavailableException> supplier(String code, String info) {
        return () -> new ServiceUnavailableException(code, info);
    }

}
    `;
}

export function TimeOutException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@RequiredArgsConstructor

public class TimeOutException extends RuntimeException {

    private final String code;
    private final String info;

    public TimeOutException(TransactionErrorMessageEnum transactionErrorMessageEnum) {
        this.code = transactionErrorMessageEnum.getErrorCode();
        this.info = transactionErrorMessageEnum.getErrorMessage();
    }

    public static Supplier<TimeOutException> supplier(TransactionErrorMessageEnum transactionErrorMessageEnum) {
        return () -> new TimeOutException(transactionErrorMessageEnum);
    }
}
    `;
}

export function UnauthorizedRequestException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.util.function.Supplier;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Custom exception handler for Unauthorized Request
 */
@Setter
@Getter
@AllArgsConstructor
public class UnauthorizedRequestException extends RuntimeException {
    private final String code;
    private final String info;

    public static Supplier<UnauthorizedRequestException> supplier(String code, String info) {
        return () -> new UnauthorizedRequestException(code, info);
    }
}
    `;
}

export function ValidationException(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception.customexceptions;

import java.io.Serializable;
import java.util.Map;

/**
 * Custom exception handler for Validation
 */
public class ValidationException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final Map<String, Serializable> details;

    public ValidationException(String message, Map<String, Serializable> details) {
        super(message);
        this.details = details;
    }

    public Map<String, Serializable> getDetails() {
        return details;
    }
}
    `;
}

export function CustomExceptionHandler(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.adventure.${proName}.dto.exception.ErrorResponse;
import com.adventure.${proName}.exception.customexceptions.AgencyResponseException;
import com.adventure.${proName}.exception.customexceptions.ErrorException;
import com.adventure.${proName}.exception.customexceptions.ResourceDuplicationException;
import com.adventure.${proName}.exception.customexceptions.ResourceNotFoundException;
import com.adventure.${proName}.exception.customexceptions.ServiceUnavailableException;
import com.adventure.${proName}.exception.customexceptions.TimeOutException;
import com.adventure.${proName}.exception.customexceptions.UnauthorizedRequestException;
import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;
import com.adventure.${proName}.utils.enums.TransactionStatusEnum;



/**
 * Custom exception handler for handling exceptions in the application.
 * This class handles exceptions of type Exception and provides a custom error
 * response
 * with INTERNAL_SERVER_ERROR status for any unexpected errors that occur in the
 * application.
 */
@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Exception handler for ResourceDuplicationException, providing a custom error
     * response
     * for cases where requested resources are not found, with BAD_REQUEST status.
     */
    @ExceptionHandler(ResourceDuplicationException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(ResourceDuplicationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Exception handler for ResourceNotFoundException, providing a custom error
     * response
     * for cases where requested resources are not found, with BAD_REQUEST status.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(ResourceNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Exception handler for ServiceUnavailableException, providing a custom error
     * response
     * for cases where requested resources are not found, with BAD_REQUEST status.
     */
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(ServiceUnavailableException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    /**
     * Exception handler for UnauthorizedRequestException, providing a custom error
     * response
     * for cases where requested resources are not found, with BAD_REQUEST status.
     */
    @ExceptionHandler(UnauthorizedRequestException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(UnauthorizedRequestException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * @return the error response status code from the transaction status code
     *         returned by the agency
     * @throws ErrorResponseException
     * @throws ErrorResponseException if the error response
     */
    @ExceptionHandler(AgencyResponseException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(AgencyResponseException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Exception handler for ErrorException, providing a custom error
     * response
     * for cases where requested resources are not found, with BAD_REQUEST status.
     */
    @ExceptionHandler(ErrorException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(ErrorException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TimeOutException.class)
    public ResponseEntity<ErrorResponse> handleErrorException(TimeOutException ex) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                ex.getCode(), ex.getInfo());
        return new ResponseEntity<>(errorResponse, HttpStatus.REQUEST_TIMEOUT);
    }

    /**
     * Global exception handler for handling generic exceptions.
     * This method handles exceptions of type Exception and provides a custom error
     * response
     * with INTERNAL_SERVER_ERROR status for any unexpected errors that occur in the
     * application.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex,
            WebRequest webRequest) {
        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Override method for handling method argument validation errors.
     * This method is called when method argument validation fails, and it generates
     * a custom error response with BAD_REQUEST status, containing error messages.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        ErrorResponse errorResponse = new ErrorResponse(TransactionStatusEnum.FAILURE.getStatusName(),
                TransactionErrorMessageEnum.ERROR_CODE_10004.getErrorCode(), String.join(", ", errors));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

}
    `;
}

