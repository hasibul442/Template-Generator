export function ErrorDetails(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.common;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ErrorDetails {
    @JsonIgnore
    @JsonAnyGetter
    private Map<String, Object> extraProps = new HashMap<>();
}
    `;
}

export function MessageResponse(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.common;

import lombok.Getter;
import lombok.Setter;

/**
 * MessegeResponse DTO for Payment Log Response.
 */
@Setter
@Getter
public class MessageResponse {
    private String info;
    private String payload;
}
    `;
}

export function PaymentLogResponse(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.common;

import lombok.Getter;
import lombok.Setter;

/**
 * Payment Log request DTO for Logging to kafka.
 */
@Setter
@Getter
public class PaymentLogResponse {
    private String orderCode;
    private String createdAt;
    private String pod;
    private String serviceName;
    private String fileName;
    private String methodName;
    private String lineNo;
    private MessageResponse message;
    private String code;
    private String logType;
}

    `;
}

export function TransactionResponse(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.common;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionResponse {
    @JsonProperty("Code")
    private String code;

    @JsonProperty("Status")
    private String status;

    @JsonIgnore
    @JsonAnyGetter
    private Map<String, Object> extraProps = new HashMap<>();
}
    `;
}

export function ErrorInfo(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.exception;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorInfo {
    @JsonProperty("Code")
    private String code;

    @JsonProperty("Info")
    private String info;
}
    `;
}

export function ErrorMessageDto(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.exception;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/**
 * ErrorMessageDto for showing error message
 */
@Setter
@Getter
public class ErrorMessageDto {

    @JsonProperty("extras")
    private String extras;

    @JsonProperty("error_message")
    private String errorMessage;

    @JsonProperty("error_code")
    private Integer errorCode;

}

      `;
}

export function ErrorResponse(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.exception;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ErrorResponse DTO for showing error response
 */
@Getter
@Setter
@NoArgsConstructor
public class ErrorResponse {

    @JsonProperty("Code")
    private String customCode;

    @JsonProperty("Errors")
    private List<ErrorInfo> errors;

    /**
     * Constructor method to show customized error response
     *
     * @param customCode
     * @param code
     * @param info
     */
    public ErrorResponse(String customCode, String code, String info) {
        this.customCode = customCode;
        this.errors = List.of(new ErrorInfo(code, info));
    }

}

      `;
}

export function TransactionCancelRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;

import com.adventure.${proName}.utils.constant.DtoValidationMessageConstants;
import com.adventure.${proName}.utils.constant.DtoValidationPatternConstants;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Cancel API GPB to RQ/RS microservice request payload
 */
@Setter
@Getter
public class TransactionCancelRequest {

    @JsonProperty("OrderCode")
    @NotEmpty(message = DtoValidationMessageConstants.ORDER_CODE_REQUIRED)
    @Size(max = 50, message = DtoValidationMessageConstants.ORDER_CODE_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN_WITH_DASH, message = DtoValidationMessageConstants.ORDER_CODE_ALPHANUMERIC_PATTERN)
    private String orderCode;

    @JsonProperty("PaymentMethodCode")
    @NotEmpty(message = DtoValidationMessageConstants.PAYMENT_METHOD_REQUIRED)
    private String paymentMethodCode;

    @JsonProperty("Price")
    @Pattern(regexp = DtoValidationPatternConstants.PRICE_PATTERN, message = DtoValidationMessageConstants.PRICE_PATTERN)
    private String price;
    
}
      `;
}

export function TransactionConfirmRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;

import com.adventure.${proName}.utils.constant.DtoValidationMessageConstants;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

/**
 * Transaction confirm request from GPB to RQ/RS.
 */
@Getter
@Setter
public class TransactionConfirmRequest {

    @JsonProperty("OrderCode")
    @NotEmpty(message = DtoValidationMessageConstants.ORDER_CODE_REQUIRED)
    private String orderCode;

}

      `;
}

export function TransactionExecuteRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;

import com.adventure.${proName}.utils.constant.DtoValidationMessageConstants;
import com.adventure.${proName}.utils.constant.DtoValidationPatternConstants;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

import org.hibernate.validator.constraints.URL;

/**
 * Transaction execute request from GPB to RQ/RS.
 */
@Getter
@Setter
public class TransactionExecuteRequest {

    @JsonProperty("OrderCode")
    @NotEmpty(message = DtoValidationMessageConstants.ORDER_CODE_REQUIRED)
    @Size(max = 50, message = DtoValidationMessageConstants.ORDER_CODE_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN_WITH_DASH, message = DtoValidationMessageConstants.CALLBACK_URL_ALPHANUMERIC_PATTERN)
    private String orderCode;

    @JsonProperty("TransactionToken")
    @NotEmpty(message = DtoValidationMessageConstants.TRANSACTION_TOKEN_REQUIRED)
    @Size(max = 50, message = DtoValidationMessageConstants.TRANSACTION_TOKEN_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN_WITH_DASH, message = DtoValidationMessageConstants.CALLBACK_URL_ALPHANUMERIC_PATTERN)
    private String transactionToken;

    @JsonProperty("Price")
    @NotEmpty(message = DtoValidationMessageConstants.PRICE_REQUIRED)
    @Pattern(regexp = DtoValidationPatternConstants.PRICE_PATTERN, message = DtoValidationMessageConstants.PRICE_PATTERN)
    private String price;

    @JsonProperty("CurrencyCd")
    @Size(max = 3, min = 3, message = DtoValidationMessageConstants.CURRENCY_CODE_SIZE)
    @NotEmpty(message = DtoValidationMessageConstants.CURRENCY_CODE_REQUIRED)
    private String currencyCd;

    @JsonProperty("LangCd")
    @NotEmpty(message = DtoValidationMessageConstants.LANGUAGE_CODE_REQUIRED)
    private String langCd;

    @JsonProperty("PaymentDueDate")
    private String paymentDueDate;

    @JsonProperty("StoreDisplayName")
    private String storeDisplayName;

    @JsonProperty("ClientField1")
    @Size(max = 100, message = DtoValidationMessageConstants.CLIENT_FIELD_1_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN, message = DtoValidationMessageConstants.CLIENT_FIELD_1_ALPHANUMERIC_PATTERN)
    private String clientField1;

    @JsonProperty("ClientField2")
    @Size(max = 100, message = DtoValidationMessageConstants.CLIENT_FIELD_2_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN, message = DtoValidationMessageConstants.CLIENT_FIELD_2_ALPHANUMERIC_PATTERN)
    private String clientField2;

    @JsonProperty("ClientField3")
    @Size(max = 100, message = DtoValidationMessageConstants.CLIENT_FIELD_3_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN, message = DtoValidationMessageConstants.CLIENT_FIELD_3_ALPHANUMERIC_PATTERN)
    private String clientField3;

    @JsonProperty("UserDevice")
    @Size(max = 5, min = 2, message = DtoValidationMessageConstants.USER_DEVICE_SIZE)
    @NotEmpty(message = DtoValidationMessageConstants.USER_DEVICE_REQUIRED)
    private String userDevice;

    @JsonProperty("GpbRedirectURL")
    @Size(max = 250, message = DtoValidationMessageConstants.REDIRECT_URL_SIZE)
    @URL(message = DtoValidationMessageConstants.REDIRECT_URL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.REDIRECT_URL_REQUIRED)
    private String gpbRedirectURL;

    @JsonProperty("SubmitPaymentRedirectURL")
    @Size(max = 250, message = DtoValidationMessageConstants.REDIRECT_URL_SIZE)
    @URL(message = DtoValidationMessageConstants.REDIRECT_URL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.REDIRECT_URL_REQUIRED)
    private String submitPaymentRedirectURL;

    @JsonProperty("CancelPaymentRedirectURL")
    @Size(max = 250, message = DtoValidationMessageConstants.REDIRECT_URL_SIZE)
    @URL(message = DtoValidationMessageConstants.REDIRECT_URL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.REDIRECT_URL_REQUIRED)
    private String cancelPaymentRedirectURL;

    @JsonProperty("ErrorRedirectURL")
    @Size(max = 250, message = DtoValidationMessageConstants.REDIRECT_URL_SIZE)
    @URL(message = DtoValidationMessageConstants.REDIRECT_URL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.REDIRECT_URL_REQUIRED)
    private String errorRedirectURL;

    @JsonProperty("CallbackURL")
    @Size(max = 250, message = DtoValidationMessageConstants.CALLBACK_URL_SIZE)
    @URL(message = DtoValidationMessageConstants.CALLBACK_URL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.CALLBACK_URL_REQUIRED)
    private String callbackURL;

    @JsonProperty("UserTelNum")
    @Size(max = 250, message = DtoValidationMessageConstants.USER_PHONE_SIZE)
    @NotEmpty(message = DtoValidationMessageConstants.USER_PHONE_REQUIRED)
    private String userTelNum;

    @JsonProperty("UserMailAddress")
    @Size(max = 250, message = DtoValidationMessageConstants.USER_EMAIL_SIZE)
    @Email(message = DtoValidationMessageConstants.USER_EMAIL_FORMAT)
    @NotEmpty(message = DtoValidationMessageConstants.USER_EMAIL_REQUIRED)
    private String userMailAddress;

    @JsonProperty("PaymentMethodCode")
    private String paymentMethodCode;

}`;
}

export function TransactionModificationRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;

import java.util.ArrayList;


import com.adventure.${proName}.utils.constant.DtoValidationMessageConstants;
import com.adventure.${proName}.utils.constant.DtoValidationPatternConstants;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/**
 * Transaction modification request from GPB to RQ/RS.
 */
@Getter
@Setter
public class TransactionModificationRequest {

    @JsonProperty("OrderCode")
    @NotEmpty(message = DtoValidationMessageConstants.ORDER_CODE_REQUIRED)
    @Size(max = 50, message = DtoValidationMessageConstants.ORDER_CODE_SIZE)
    @Pattern(regexp = DtoValidationPatternConstants.ALPHANUMERIC_PATTERN_WITH_DASH, message = DtoValidationMessageConstants.ORDER_CODE_ALPHANUMERIC_PATTERN)
    private String orderCode;

    @JsonProperty("Price")
    @NotEmpty(message = DtoValidationMessageConstants.PRICE_REQUIRED)
    @Pattern(regexp = DtoValidationPatternConstants.PRICE_PATTERN, message = DtoValidationMessageConstants.PRICE_PATTERN)
    private String price;

    @JsonProperty("CurrencyCd")
    @NotEmpty(message = DtoValidationMessageConstants.CURRENCY_CODE_REQUIRED)
    private String currencyCd;

    @JsonProperty("PaymentMethodCode")
    @NotEmpty(message = DtoValidationMessageConstants.PAYMENT_METHOD_REQUIRED)
    private String paymentMethodCode;

    @JsonProperty("RefundReferenceCodes")
    @NotEmpty(message = DtoValidationMessageConstants.REFUND_REFERENCE_CODE_REQUIRED)
    private ArrayList<String> refundReferenceCodes;

}`;
}

export function TransactionSearchRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;



import com.adventure.${proName}.utils.constant.DtoValidationMessageConstants;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO for Transaction Search request
 */
@Setter
@Getter
public class TransactionSearchRequest {

    @JsonProperty("OrderCode")
    @NotEmpty(message = DtoValidationMessageConstants.ORDER_CODE_REQUIRED)
    @Size(max = 50, message = DtoValidationMessageConstants.ORDER_CODE_SIZE)
    private String orderCode;

}
    `;
}

export function TransactionSearchResponse(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.rqrs;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/**
 * This DTO for Transaction search response
 */
@Setter
@Getter
public class TransactionSearchResponse {

    @JsonProperty("PaymentAgencyInfo")
    private Object paymentAgencyInfo;

}
    `;
}

export function WebhookRequest(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.dto.webhook;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/**
 * Request payload for webhook request
 */
@Setter
@Getter
@JsonIgnoreProperties(ignoreUnknown = false)
public class WebhookRequest {


}
    `;
}
