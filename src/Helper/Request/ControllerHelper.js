export function createHealthController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
    package com.adventure.${proName}.controller;

    import java.time.LocalDateTime;
    import java.time.ZoneId;
    import java.time.format.DateTimeFormatter;
    import java.util.HashMap;
    import java.util.Map;
    import java.util.Properties;
    import java.util.concurrent.ExecutionException;

    import org.apache.kafka.clients.admin.AdminClient;
    import org.apache.kafka.clients.admin.AdminClientConfig;
    import org.apache.kafka.clients.admin.ListTopicsResult;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.boot.info.BuildProperties;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.adventure.${proName}.repository.PaymentRepository;
    import com.adventure.${proName}.utils.constant.UrlConstants;

    /**
     * Health Check Controller for checking the service startup status
     */
    @RestController
    @RequestMapping(UrlConstants.PREFIX_URL)
    public class HealthCheckController {
        @Autowired
        private PaymentRepository paymentRepository;

        @Autowired
        private BuildProperties buildProperties;

        @Value("\${spring.kafka.producer.bootstrap - servers}")
        private String kafkaBootstrapServers;

        @GetMapping(UrlConstants.HEALTH_CHECK)
        public Map<String, String> healthCheck() {
            Map<String, String> response = new HashMap<>();
            try {
                paymentRepository.count();
                response.put("Database Connection", "Success");
                response.put("Microservice Status", "Adyen microservice is ok");

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                LocalDateTime buildTime = LocalDateTime.ofInstant(buildProperties.getTime(), ZoneId.systemDefault());

                response.put("Application Building Time", buildTime.format(formatter));
                response.put("Application Name", buildProperties.getName());
                response.put("Application Version", buildProperties.getVersion());
                if (isKafkaRunning()) {
                    response.put("Kafka Status", "ok");
                } else {
                    response.put("Kafka Status", "error");
                }
            } catch (Exception e) {
                response.put("Database Connection", "Failure");
                response.put("message", "An error occurred: " + e.getMessage());
            }
            return response;
        }

        private boolean isKafkaRunning() {
            Properties config = new Properties();
            config.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBootstrapServers);
            try (AdminClient adminClient = AdminClient.create(config)) {
                ListTopicsResult topics = adminClient.listTopics();
                topics.names().get();
                return true;
            } catch (InterruptedException | ExecutionException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
    }
    `;
}

export function executeController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
  package com.adventure.${proName}.controller;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.adventure.${proName}.dto.common.TransactionResponse;
    import com.adventure.${proName}.dto.rqrs.TransactionExecuteRequest;
    import com.adventure.${proName}.service.rqrshandler.spec.TransactionExecuteService;
    import com.adventure.${proName}.utils.constant.UrlConstants;
    import com.fasterxml.jackson.databind.JsonNode;

    import jakarta.validation.Valid;

    /**
     * Transaction Execute Controller for create order
     */
    @RestController
    @RequestMapping(UrlConstants.PREFIX_URL)
    public class TransactionExecuteController {

        @Autowired
        private TransactionExecuteService transactionExecuteService;

        /**
         * Transaction execute request endpoint
         * 
         * @param transactionExecuteRequest
         * @return TransactionResponse
         * @throws Exception
         */
        @PostMapping(UrlConstants.TRANSACTION_EXECUTE)
        public ResponseEntity<TransactionResponse> executeTransaction(
                @Valid @RequestBody TransactionExecuteRequest transactionExecuteRequest) throws Exception {

            return ResponseEntity.ok(transactionExecuteService.transactionExecute(transactionExecuteRequest));
        }

        /**
         * Transaction terminate request endpoint
         * 
         * @param transactionExecuteTerminateRequest
         * @return TransactionResponse
         * @throws Exception
         */
        @PostMapping(UrlConstants.TRANSACTION_EXECUTE_TERMINATE)
        public ResponseEntity<TransactionResponse> executeTransactionWebhook(
                @Valid @RequestBody JsonNode transactionExecuteTerminateRequest) throws Exception {

            return ResponseEntity
                    .ok(transactionExecuteService.transactionExecuteWebhook(transactionExecuteTerminateRequest));
        }
    }
`;
}

export function confirmController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
    package com.adventure.${proName}.controller;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionConfirmRequest;
import com.adventure.${proName}.service.rqrshandler.spec.TransactionConfirmService;
import com.adventure.${proName}.utils.constant.UrlConstants;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Confirm Controller for capturing the payment transaction.
 */
@RestController
@RequestMapping(UrlConstants.PREFIX_URL)
public class TransactionConfirmController {

    @Autowired
    private TransactionConfirmService transactionConfirmService;

    /**
     * Transaction confirm request endpoint
     * 
     * @param transactionConfirmRequest
     * @return TransactionResponse
     * @throws Exception
     */
    @PostMapping(UrlConstants.TRANSACTION_CONFIRM)
    public ResponseEntity<TransactionResponse> confirmTransaction(
            @Valid @RequestBody TransactionConfirmRequest transactionConfirmRequest) throws Exception {

        return ResponseEntity.ok(transactionConfirmService.transactionConfirm(transactionConfirmRequest));
    }

}
  `;
}

export function cancelController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
    package com.adventure.${proName}.controller;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionCancelRequest;
import com.adventure.${proName}.service.rqrshandler.spec.AbstractRefundService;
import com.adventure.${proName}.utils.constant.UrlConstants;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Transaction Cancel Controller for refund order
 */
@RestController
@RequestMapping(UrlConstants.PREFIX_URL)
public class TransactionCancelController {

    @Autowired
    @Qualifier("transactionCancelServiceImpl")
    private AbstractRefundService transactionCancelService;

    /**
     * Transaction cancel request endpoint
     *
     * @param transactionCancelRequest
     * @return TransactionResponse
     * @throws Exception
     */
    @PostMapping(UrlConstants.TRANSACTION_CANCELLATION)
    public ResponseEntity<TransactionResponse> transactionCancel(
            @Valid @RequestBody TransactionCancelRequest transactionCancelRequest) throws Exception {
        return ResponseEntity.ok(transactionCancelService.transactionRefund(transactionCancelRequest));
    }

}
  `;
}

export function modificationController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
    package com.adventure.${proName}.controller;

import com.adventure.${proName}.dto.common.TransactionResponse;
import com.adventure.${proName}.dto.rqrs.TransactionModificationRequest;
import com.adventure.${proName}.service.rqrshandler.spec.AbstractRefundService;
import com.adventure.${proName}.utils.constant.UrlConstants;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Transaction Cancel Controller for partial refund
 */
@RestController
@RequestMapping(UrlConstants.PREFIX_URL)
public class TransactionModificationController {

    @Autowired
    @Qualifier("transactionModificationServiceImpl")
    private AbstractRefundService transactionModificationService;

    /**
     * Transaction modify request endpoint
     *
     * @param transactionModificationRequest
     * @return TransactionResponse
     * @throws Exception
     */
    @PostMapping(UrlConstants.TRANSACTION_MODIFICATION)
    public ResponseEntity<TransactionResponse> modificationTransaction(
            @Valid @RequestBody TransactionModificationRequest transactionModificationRequest) throws Exception {

        return ResponseEntity.ok(transactionModificationService.transactionRefund(transactionModificationRequest));
    }

}

  `;
}

export function searchController(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
    package com.adventure.${proName}.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adventure.${proName}.dto.rqrs.TransactionSearchRequest;
import com.adventure.${proName}.dto.rqrs.TransactionSearchResponse;
import com.adventure.${proName}.service.rqrshandler.spec.TransactionSearchService;
import com.adventure.${proName}.utils.constant.UrlConstants;

import jakarta.validation.Valid;

/**
 * Transaction Search Controller for inquery order
 */
@RestController
@RequestMapping(UrlConstants.PREFIX_URL)
public class TransactionSearchController {
    @Autowired
    private TransactionSearchService transactionSearchService;
    
    /**
     * Endpoint for search a transaction.
     *
     * @param transactionSearchRequest
     * @return TransactionSearchResponse
     * @throws Exception
     */
    @PostMapping(UrlConstants.TRANSACTION_SEARCH)
    public ResponseEntity<TransactionSearchResponse> transactionSearch(
            @Valid @RequestBody TransactionSearchRequest transactionSearchRequest) throws Exception {

        return ResponseEntity.ok(transactionSearchService.searchTransaction(transactionSearchRequest));
    }
}

  `;
}
