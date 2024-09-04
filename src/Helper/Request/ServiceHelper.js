export function RsRqHttpClientService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  let proNames = projectName.toLowerCase();
  return `
package com.adventure.${proName}.service.webclient;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.adventure.${proName}.utils.constant.LogTypeConstants;
import com.adventure.${proName}.utils.constant.ServiceConstants;
import com.adventure.${proName}.utils.constant.UrlConstants;
import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;
import com.adventure.${proName}.utils.helper.Helper;
import com.adventure.${proName}.utils.helper.KafkaLogger;

import jakarta.validation.Payload;

@Service
public class RsRqHttpClientService {

    @Value("\${${proNames}.baseUrl}")
    private String baseUrl;

    @Value("\${${proNames}.timeout}")
    private int timeout;

    @Value("\${${proNames}.apikey}")
    private String apiKey;

    @Value("\${${proNames}.webhook.host.baseUrl}")
    private String webhookHostURL;

    @Autowired
    private KafkaLogger logger;

    private static final int maxRetry = 3;
    private static final Duration RETRY_DELAY = Duration.ofSeconds(2);

    public String callAgency(String payload, String apiEndPoint) throws InterruptedException {
        String url = baseUrl + apiEndPoint;
        return makeRequest(payload, url, true); // Add API key for this call
    }

    public String callWebhook(String payload) throws InterruptedException {
        String url = webhookHostURL + UrlConstants.WEBHOOK_RELATIVE_URL;
        return makeRequest(payload, url, false); // Do not add API key for this call
    }

    private String makeRequest(String payload, String url, boolean addApiKey) throws InterruptedException {

        HttpClient client = HttpClient.newHttpClient();

        for (int attempt = 1; attempt <= maxRetry; attempt++) {
            try {
                HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                        .uri(new URI(url))
                        .POST(BodyPublishers.ofString(payload))
                        .timeout(Duration.ofMinutes(1));

                if (addApiKey) {
                    requestBuilder.header("X-API-Key", apiKey);
                }
                requestBuilder.header("Content-Type", "application/json");

                logger.logSuccess(ServiceConstants.SERVICE_RSRQWEBCLIENT,payload, Helper.getStackTrace(),LogTypeConstants.LOGS_TYPE_INFO,LogTypeConstants.AGENCY_CALLED);
                HttpRequest request = requestBuilder.build();
                HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

                logger.logSuccess(ServiceConstants.SERVICE_RSRQWEBCLIENT,response.body(), Helper.getStackTrace(),LogTypeConstants.LOGS_TYPE_INFO, LogTypeConstants.HTTPCLIENT_SUCCESS_RESPONSE);

                return response.body(); // Return response body on success

            } catch (Exception e) {
                if (attempt == maxRetry) {
                    logger.logError(ServiceConstants.SERVICE_RSRQWEBCLIENT, payload, Helper.getStackTrace(), TransactionErrorMessageEnum.ERROR_CODE_10005, "Request failed after " + maxRetry + " attempts" + e);

                    throw new IllegalStateException("Max retires reached");
                } else {
                    // Log retry attempt
                    logger.logError(ServiceConstants.SERVICE_RSRQWEBCLIENT, payload, Helper.getStackTrace(), TransactionErrorMessageEnum.ERROR_CODE_10005, "Request failed on attempt " + attempt + ".Retrying..."+ e);
                    Thread.sleep(RETRY_DELAY.toMillis()); // Delay before retrying
                }
            }
        }

        throw new IllegalStateException("Unexpected state reached in retry loop");
    }
} 
`;
}

export function TransactionCancelServiceImpl(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionCancelRequest;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.repository.PaymentRepository;
import com.adventure.${proName}.service.rqrshandler.spec.AbstractRefundService;
import com.adventure.${proName}.service.rqrshandler.utils.DBUtil;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.rqrshandler.utils.TransactionValidation;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service Implementation for handling transaction cancel requests
 */
@Service("transactionCancelServiceImpl")
public class TransactionCancelServiceImpl extends AbstractRefundService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionValidation transactionValidation;

    @Autowired
    private DBUtil dbUtil;

    @Autowired
    private ResponseHelper responseHelper;

    /**
     * Cancel payment transaction
     *
     * @param transactionRequest
     * @return TransactionResponse
     */
    @Transactional
    @Override
    public <T> TransactionResponse transactionRefund(T transactionRequest) throws Exception {
        TransactionCancelRequest transactionCancelRequest = new ObjectMapper()
                .convertValue(transactionRequest, TransactionCancelRequest.class);
        // log for service initialization
        responseHelper.logServiceInitialize(transactionCancelRequest);

        Payment payment = paymentRepository
                .findByOrderCode(transactionCancelRequest.getOrderCode());

        // Check payment existence by order code
        transactionValidation.checkNullPaymentRepository(payment,
                transactionCancelRequest);
        // check payment status whether its captured or not
        transactionValidation.checkInvalidPaymentStatus(payment,
                transactionCancelRequest);
        // Initial save to database for transaction initiate
        saveInitialEntityOperation(transactionCancelRequest, payment);
        return sendGatewayRefundRequest(transactionCancelRequest, payment);

    }

    /**
     * Update initial DB operation
     *
     * @param transactionCancelRequest
     * @param payment
     */
    private void saveInitialEntityOperation(TransactionCancelRequest transactionCancelRequest, Payment payment) {
        transactionCancelRequest.setPrice(payment.getCurrentPrice().toString());
        dbUtil.saveInitialTransaction(transactionCancelRequest, payment);
    }

}
`;
}

export function TransactionConfirmServiceImpl(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionConfirmRequest;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.exception.customexceptions.AgencyResponseException;
import com.adventure.${proName}.repository.PaymentRepository;
import com.adventure.${proName}.service.rqrshandler.spec.TransactionConfirmService;
import com.adventure.${proName}.service.rqrshandler.utils.AgencyRequest;
import com.adventure.${proName}.service.rqrshandler.utils.DBUtil;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.rqrshandler.utils.TransactionValidation;
import com.adventure.${proName}.service.webclient.RsRqHttpClientService;
import com.adventure.${proName}.utils.constant.AgencyJsonConstants;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Transaction confirmation service implementation.
 */

@Service
public class TransactionConfirmServiceImpl implements TransactionConfirmService {

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    TransactionValidation transactionValidation;

    @Autowired
    private ResponseHelper responseHelper;

    ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    AgencyRequest agencyRequest;

    @Autowired
    private DBUtil dbUtil;

    @Autowired
    private RsRqHttpClientService httpClientService;

    /**
     * Transaction confirmation service implementation.
     *
     * @param transactionConfirmRequest
     * @return transactionResponse
     * @throws Exception
     */
    @Override
    @Transactional
    public TransactionResponse transactionConfirm(TransactionConfirmRequest transactionConfirmRequest)
            throws Exception {

        // log for service initialization
        responseHelper.logServiceInitialize(transactionConfirmRequest);

        Payment payment = paymentRepository.findByOrderCode(transactionConfirmRequest.getOrderCode());
        transactionValidation.checkNullPaymentRepository(payment, transactionConfirmRequest);
        transactionValidation.checkInvalidPaymentStatus(payment, transactionConfirmRequest);
        dbUtil.saveInitialTransaction(transactionConfirmRequest, payment);

        return sendConfirmRequestToAgency(transactionConfirmRequest, payment);
    }

    private TransactionResponse sendConfirmRequestToAgency(TransactionConfirmRequest transactionConfirmRequest,
            Payment payment) throws JsonProcessingException, InterruptedException {

        try {
            // update payment status before agency call (it is Transactional)
            dbUtil.updatePaymentInfo(payment, transactionConfirmRequest);
            JsonNode agencyResponse = objectMapper.readTree(httpClientService.callAgency(
                    agencyRequest.prepareAgencyCommonDto(transactionConfirmRequest, payment),
                    "/payments/" + payment.getPaymentPspReference() + "/captures"));

            if (agencyResponse.has(AgencyJsonConstants.STATUS) && agencyResponse.get(AgencyJsonConstants.STATUS)
                    .asText().equals(AgencyJsonConstants.STATUS_RECEIVED)) {
                return responseHelper.createTransactionSuccessResponse(transactionConfirmRequest);
                // throw exception for invalid response
            } else {
                throw responseHelper.handleInvalidResponseFromAgency(agencyResponse);
            }
        } catch (AgencyResponseException e) {
            throw e;

        } catch (Exception e) {
            throw responseHelper.handleExceptionFromAgency(e);
        }

    }
}

`;
}

export function TransactionExecuteServiceImpl(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
  package com.adventure.${proName}.service.rqrshandler.impl;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionExecuteRequest;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.exception.customexceptions.AgencyResponseException;
import com.adventure.${proName}.exception.customexceptions.ResourceNotFoundException;
import com.adventure.${proName}.repository.PaymentRepository;
import com.adventure.${proName}.service.rqrshandler.spec.TransactionExecuteService;
import com.adventure.${proName}.service.rqrshandler.utils.AgencyRequest;
import com.adventure.${proName}.service.rqrshandler.utils.DBUtil;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.rqrshandler.utils.TransactionValidation;
import com.adventure.${proName}.service.webclient.RsRqHttpClientService;
import com.adventure.${proName}.simulatewebhookhandler.SimulateWebhookService;
import com.adventure.${proName}.utils.constant.AgencyJsonConstants;
import com.adventure.${proName}.utils.constant.ServiceConstants;
import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;
import com.adventure.${proName}.utils.enums.TransactionStatusEnum;
import com.adventure.${proName}.utils.enums.UpdatedByEnum;
import com.adventure.${proName}.utils.helper.KafkaLogger;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Transaction Execute Service Impl for agency order create
 */
@Service
public class TransactionExecuteServiceImpl implements TransactionExecuteService {

    @Autowired
    private DBUtil dbUtil;

    @Autowired
    private ResponseHelper responseHelper;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SimulateWebhookService simulateWebhookService;

    @Autowired
    RsRqHttpClientService httpClientService;

    @Autowired
    private TransactionValidation transactionFailureValidation;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AgencyRequest agencyRequest;

    @Autowired
    KafkaLogger logger;

    /**
     * Service for transaction Execute
     *
     * @param transactionExecuteRequest
     * @return TransactionResponse
     * @throws Exception
     */
    @Override
    public TransactionResponse transactionExecute(TransactionExecuteRequest transactionExecuteRequest)
            throws Exception {
        // log for service initialization
        responseHelper.logServiceInitialize(transactionExecuteRequest);

        Payment payment = paymentRepository.findByOrderCode(transactionExecuteRequest.getOrderCode());

        if (payment != null && payment.getStatus().equals(TransactionStatusEnum.CAPTURED.getStatus())) {
            throw new ResourceNotFoundException(TransactionErrorMessageEnum.ERROR_CODE_10011.getErrorCode(),
                    TransactionErrorMessageEnum.ERROR_CODE_10011.getErrorMessage());
        }

        payment = payment == null ? new Payment() : payment;

        // Initial save to database for transaction execute
        saveInitialEntityOperation(transactionExecuteRequest, payment);

        // send request to agency for Transaction Execution
        return sendTransactionExecuteRequestToGateway(transactionExecuteRequest, payment);
    }

    /**
     * save initial nontransactional entity operation
     *
     * @param transactionExecuteRequest
     * @param payment
     */
    private void saveInitialEntityOperation(TransactionExecuteRequest transactionExecuteRequest, Payment payment) {
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STANDARD);

        modelMapper.typeMap(TransactionExecuteRequest.class, Payment.class)
                .addMappings(mapper -> mapper.map(src -> src.getPrice(), Payment::setCurrentPrice));

        modelMapper.map(transactionExecuteRequest, payment);

        payment.setStatus(TransactionStatusEnum.TRADING.getStatus());
        payment.setCurrentOperation(ServiceConstants.SERVICE_EXECUTE);
        payment.setUpdatedBy(UpdatedByEnum.RQRS.getupdatedBy());
        paymentRepository.save(payment);
    }

    /**
     * Send request to agency for Transaction Execute
     *
     * @param payment
     * @param transactionExecuteRequest
     * @return TransactionResponse
     * @throws JsonProcessingException
     */
    private TransactionResponse sendTransactionExecuteRequestToGateway(
            TransactionExecuteRequest transactionExecuteRequest, Payment payment) throws JsonProcessingException {

        String logMessage = TransactionStatusEnum.FAILURE.getStatusName();

        try {
            // update payment table before agency call
            dbUtil.updatePaymentInfo(payment, transactionExecuteRequest);

            return responseHelper.createTransactionSuccessResponse(transactionExecuteRequest, payment.getOrderCode(),
                    agencyResponse.get(AgencyJsonConstants.ACTION).get(AgencyJsonConstants.URL));

        } catch (AgencyResponseException e) {
            logMessage = e.getInfo();
            throw e;

        } catch (Exception e) {
            logMessage = e.getMessage();
            throw responseHelper.handleExceptionFromAgency(e);

        } finally {
            responseHelper.logTransactionResponse(transactionExecuteRequest, logMessage);
        }
    }

    /**
     * Returns the terminate execute request in the specified format 
     * 
     * @param transactionExecuteTerminateRequest
     * @param payment
     * @return String
     */
    private String ${proName}(JsonNode transactionExecuteTerminateRequest, Payment payment) {

        String transaction = transactionExecuteTerminateRequest.get("params").asText();

        return rootNode.toString();
    }

    /**
     * simulate webhook for transaction terminate request
     *
     * @param transactionExecuteTerminateRequest
     * @return TransactionResponse
     * @throws Exception
     */
    @Override
    public TransactionResponse transactionExecuteWebhook(JsonNode transactionExecuteTerminateRequest) throws Exception {
        String executeStatus = TransactionStatusEnum.FAILURE.getStatusName();
        JsonNode additionalAgencyResponse = null;
        String orderId = transactionExecuteTerminateRequest.get("orderCode").asText();

        TransactionExecuteRequest transactionExecuteRequest = new TransactionExecuteRequest();
        transactionExecuteRequest.setOrderCode(orderId);

        // Find payment by order code and check payment existence by order code
        Payment payment = paymentRepository.findByOrderCode(orderId);
        transactionFailureValidation.checkNullPaymentRepository(payment, transactionExecuteTerminateRequest);

        try {
            String additionalPayload = ${proName}(transactionExecuteTerminateRequest, payment);
            // call to agency for complete execution transaction
            

            return responseHelper.createTransactionTerminateSuccessResponse(executeStatus);

        } catch (AgencyResponseException e) {
            return responseHelper.createTransactionTerminateSuccessResponse(executeStatus);

        } catch (Exception e) {
            executeStatus = TransactionStatusEnum.ERROR.getStatusName();

            return responseHelper.createTransactionTerminateSuccessResponse(executeStatus);

        } finally {
            executeStatus = " Status: " + executeStatus + " Response: " + additionalAgencyResponse;
            responseHelper.logTransactionResponse(transactionExecuteTerminateRequest, executeStatus);
        }
    }
}
  `;
}

export function TransactionModificationServiceImpl(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionModificationRequest;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.repository.PaymentRepository;
import com.adventure.${proName}.service.rqrshandler.spec.AbstractRefundService;
import com.adventure.${proName}.service.rqrshandler.utils.DBUtil;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.rqrshandler.utils.TransactionValidation;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * service class for Transaction Modification
 */
@Service("transactionModificationServiceImpl")
public class TransactionModificationServiceImpl extends AbstractRefundService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionValidation transactionValidation;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ResponseHelper responseHelper;

    @Autowired
    private DBUtil dbUtil;

    /**
     * Modify Payment Transaction
     *
     * @param transactionRequest
     * @return TransactionResponse
     */
    @Override
    @Transactional
    public <T> TransactionResponse transactionRefund(T transactionRequest) throws Exception {
        TransactionModificationRequest transactionModificationRequest = new ObjectMapper()
                .convertValue(transactionRequest, TransactionModificationRequest.class);
        // log for service initialization
        responseHelper.logServiceInitialize(transactionModificationRequest);

        Payment payment = paymentRepository
                .findByOrderCode(transactionModificationRequest.getOrderCode());
        // Check payment existence by order code
        transactionValidation.checkNullPaymentRepository(payment, transactionModificationRequest);
        // check payment status whether its captured or not
        transactionValidation.checkInvalidPaymentStatus(payment, transactionModificationRequest);
        saveInitialEntityOperation(transactionModificationRequest, payment);
        return sendGatewayRefundRequest(transactionModificationRequest, payment);
    }

    /**
     * Update initial DB operation
     *
     * @param transactionModificationRequest
     * @param payment
     */
    private void saveInitialEntityOperation(TransactionModificationRequest transactionModificationRequest,
            Payment payment) {

        payment.setRefundReferenceCodes(String.valueOf(transactionModificationRequest.getRefundReferenceCodes()));
        dbUtil.saveInitialTransaction(transactionModificationRequest, payment);
    }

}

`;
}

export function TransactionSearchServiceImpl(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.rqrs.TransactionSearchRequest;
import com.adventure.${proName}.dto.rqrs.TransactionSearchResponse;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.entity.Refund;
import com.adventure.${proName}.entity.WebhookPayload;
import com.adventure.${proName}.repository.PaymentRepository;
import com.adventure.${proName}.repository.RefundRepository;
import com.adventure.${proName}.repository.WebhookPayloadRepository;
import com.adventure.${proName}.service.rqrshandler.spec.TransactionSearchService;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.rqrshandler.utils.TransactionValidation;
import com.adventure.${proName}.utils.enums.TransactionErrorMessageEnum;
import com.adventure.${proName}.utils.enums.TransactionStatusEnum;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * service class for Transaction search
 */
@Service
public class TransactionSearchServiceImpl implements TransactionSearchService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionValidation transactionFailureValidation;


    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ResponseHelper responseHelper;

    /**
     * Searches for a transaction based on the provided transaction search request.
     *
     * @param transactionSearchRequest The transaction search request containing the
     *                                 order code.
     * @return The transaction search response containing the payment agency
     *         information.
     * @throws Exception If an error occurs during the transaction search.
     */
    @Override
    public TransactionSearchResponse searchTransaction(TransactionSearchRequest transactionSearchRequest)
            throws Exception {

        responseHelper.logServiceInitialize(transactionSearchRequest);

        ObjectNode payloadDetails;

        // Check payment existence by order code
        Payment payment = paymentRepository.findByOrderCode(transactionSearchRequest.getOrderCode());
        transactionFailureValidation.checkNullPaymentRepository(payment, transactionSearchRequest);

        TransactionSearchResponse transactionSearchResponse = new TransactionSearchResponse();
        transactionSearchResponse.setPaymentAgencyInfo(payloadDetails);
        return transactionSearchResponse;
    }
}
`;
}

export function AbstractRefundService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.spec;

import org.springframework.beans.factory.annotation.Autowired;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionModificationRequest;
import com.adventure.${proName}.entity.Payment;
import com.adventure.${proName}.exception.customexceptions.AgencyResponseException;
import com.adventure.${proName}.service.rqrshandler.utils.AgencyRequest;
import com.adventure.${proName}.service.rqrshandler.utils.DBUtil;
import com.adventure.${proName}.service.rqrshandler.utils.ResponseHelper;
import com.adventure.${proName}.service.webclient.RsRqHttpClientService;
import com.adventure.${proName}.utils.constant.AgencyJsonConstants;
import com.adventure.${proName}.utils.enums.TransactionStatusEnum;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class AbstractRefundService {

    @Autowired
    private DBUtil dbUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RsRqHttpClientService httpClientService;

    @Autowired
    ResponseHelper responseHelper;

    @Autowired
    private AgencyRequest agencyRequest;

    /**
     * @param transactionRequest
     * @throws JsonProcessingException
     * @throws JsonMappingException
     */
    public abstract <T> TransactionResponse transactionRefund(T transactionRequest) throws Exception;

    public <T> TransactionResponse sendGatewayRefundRequest(T transactionRequest, Payment payment) {
        String logMessage = TransactionStatusEnum.FAILURE.getStatusName();

        try {
            String agencyUrl = "/payments;
            dbUtil.updatePaymentInfo(payment, transactionRequest);
            dbUtil.updateRefundInfo(payment, transactionRequest);
            // for partial refund
            if (transactionRequest.getClass().equals(TransactionModificationRequest.class)) {
                agencyUrl = agencyUrl + "/refunds";
                // for full refund
            } else {
                agencyUrl = agencyUrl + "/reversals";
            }

            JsonNode agencyResponse = objectMapper.readTree(
                    httpClientService.callAgency(agencyRequest.prepareAgencyCommonDto(transactionRequest, payment),
                            agencyUrl));

            if (agencyResponse.has(AgencyJsonConstants.STATUS) && agencyResponse.get(AgencyJsonConstants.STATUS)
                    .asText().equals(AgencyJsonConstants.STATUS_RECEIVED)) {
                dbUtil.saveDataAfterAgencyCall(payment, agencyResponse);
                logMessage = TransactionStatusEnum.SUCCESS.getStatusName();
                return responseHelper.createTransactionSuccessResponse(transactionRequest);

                // throw exception for invalid response
            } else {
                throw responseHelper.handleInvalidResponseFromAgency(agencyResponse);
            }

        } catch (AgencyResponseException e) {
            logMessage = e.getInfo();
            throw e;

        } catch (Exception e) {
            logMessage = e.getMessage();
            throw responseHelper.handleExceptionFromAgency(e);

        } finally {
            // log final message for service
            responseHelper.logTransactionResponse(transactionRequest, logMessage);

        }
    }
}
`;
}

export function TransactionConfirmService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
  package com.adventure.${proName}.service.rqrshandler.spec;

import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionConfirmRequest;

/**
 * Transaction Confirm Service
 */
@Service
public interface TransactionConfirmService {

    /**
     * @param transactionConfirmRequest
     * @return
     * @throws Exception
     */
    TransactionResponse transactionConfirm(TransactionConfirmRequest transactionConfirmRequest) throws Exception;
}
    `;
}
export function TransactionExecuteService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.spec;

import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionExecuteRequest;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Transaction Execute Service
 */
@Service
public interface TransactionExecuteService {

    /**
     * @param request
     * @return
     * @throws Exception
     */
    TransactionResponse transactionExecute(TransactionExecuteRequest request) throws Exception;

    TransactionResponse transactionExecuteWebhook(JsonNode transactionExecuteTerminateRequest) throws Exception;

}
    `;
}
export function TransactionModificationService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.spec;

import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionModificationRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

/**
 * Transaction Search Service
 */
@Service
public interface TransactionModificationService {

    /**
     * @param transactionModificationRequest
     * @throws JsonProcessingException
     * @throws JsonMappingException
     */
    TransactionResponse transactionModification(TransactionModificationRequest transactionModificationRequest)
            throws Exception;

}

    `;
}

export function TransactionSearchService(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.rqrshandler.spec;

import org.springframework.stereotype.Service;

import com.adventure.${proName}.dto.rqrs.TransactionSearchRequest;
import com.adventure.${proName}.dto.rqrs.TransactionSearchResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

/**
 * Transaction Search Service
 */
@Service
public interface TransactionSearchService {
    /**
     * @param transactionSearchRequest
     * @throws JsonProcessingException
     * @throws JsonMappingException
     */
    TransactionSearchResponse searchTransaction(TransactionSearchRequest transactionSearchRequest) throws Exception;
}

    `;
}
