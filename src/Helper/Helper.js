import staticData from "./../data/StaticTextData.json";
import {
  cancelController,
  confirmController,
  createHealthController,
  executeController,
  modificationController,
  searchController,
} from "./Request/ControllerHelper";
import {
  ErrorDetails,
  ErrorInfo,
  ErrorMessageDto,
  ErrorResponse,
  MessageResponse,
  PaymentLogResponse,
  TransactionCancelRequest,
  TransactionConfirmRequest,
  TransactionExecuteRequest,
  TransactionModificationRequest,
  TransactionResponse,
  TransactionSearchRequest,
  TransactionSearchResponse,
  WebhookRequest,
} from "./Request/DtoHelper";
import { Payment, Refund } from "./Request/Entity";
import {
  AgencyResponseException,
  CustomExceptionHandler,
  ErrorException,
  ResourceDuplicationException,
  ResourceNotFoundException,
  ServiceUnavailableException,
  TimeOutException,
  UnauthorizedRequestException,
  ValidationException,
} from "./Request/ExceprionHelper";
import { KafkaProducer, TopicLister } from "./Request/KafkaHelper";
import {
  PaymentRepository,
  RefundRepository,
} from "./Request/RepositoryHelper";
import {
  AbstractRefundService,
  RsRqHttpClientService,
  TransactionCancelServiceImpl,
  TransactionConfirmService,
  TransactionConfirmServiceImpl,
  TransactionExecuteService,
  TransactionExecuteServiceImpl,
  TransactionModificationService,
  TransactionModificationServiceImpl,
  TransactionSearchService,
} from "./Request/ServiceHelper";

export const CreateMvnFolder = (parentFolder) => {
  const mvnFolder = parentFolder.folder(".mvn");
  const wrapperFolder = mvnFolder.folder("wrapper");
  wrapperFolder.file(
    "maven-wrapper.properties",
    staticData.MavenWrapper.content
  );
};

export const CreatePackageFolder = (parentFolder, projectName, projectType) => {
  const javaFolder = parentFolder.folder("java");
  const comFolder = javaFolder.folder("com");
  const companyFolder = comFolder.folder("adventure");
  const projectFolder = companyFolder.folder(
    projectName.toLowerCase() + projectType
  );
  MakeController(projectName, projectFolder);
  MakeDto(projectName, projectFolder);
  MakeEntity(projectName, projectFolder);
  MakeException(projectName, projectFolder);
  MakeRepository(projectName, projectFolder);
  MakeService(projectName, projectFolder);
};

export const MakeController = (projectName, parentFolder) => {
  const controllerFolder = parentFolder.folder("controller");
  const health = createHealthController(projectName);
  const execute = executeController(projectName);
  const confirm = confirmController(projectName);
  const cancel = cancelController(projectName);
  const modification = modificationController(projectName);
  const search = searchController(projectName);
  controllerFolder.file("HealthCheckController.java", health);
  controllerFolder.file("TransactionExecuteController.java", execute);
  controllerFolder.file("TransactionConfirmController.java", confirm);
  controllerFolder.file("TransactionCancelController.java", cancel);
  controllerFolder.file("TransactionModificationController.java", modification);
  controllerFolder.file("TransactionSearchController.java", search);
};

export const MakeDto = (projectName, parentFolder) => {
  const dtoFolder = parentFolder.folder("dto");

  const common = dtoFolder.folder("common");
  let errorDetails = ErrorDetails(projectName);
  let messRes = MessageResponse(projectName);
  let paymentLogRes = PaymentLogResponse(projectName);
  let tranRes = TransactionResponse(projectName);
  common.file("ErrorDetails.java", errorDetails);
  common.file("MessageResponse.java", messRes);
  common.file("PaymentLogResponse.java", paymentLogRes);
  common.file("TransactionResponse.java", tranRes);

  let exception = dtoFolder.folder("exception");
  let errinfo = ErrorInfo(projectName);
  let errMsg = ErrorMessageDto(projectName);
  let errRes = ErrorResponse(projectName);
  exception.file("ErrorInfo.java", errinfo);
  exception.file("ErrorMessageDto.java", errMsg);
  exception.file("ErrorResponse.java", errRes);

  const request = dtoFolder.folder("rqrs");
  let cancel = TransactionCancelRequest(projectName);
  let confirm = TransactionConfirmRequest(projectName);
  let execute = TransactionExecuteRequest(projectName);
  let modification = TransactionModificationRequest(projectName);
  let searchReq = TransactionSearchRequest(projectName);
  let searchRes = TransactionSearchResponse(projectName);
  request.file("TransactionCancelRequest.java", cancel);
  request.file("TransactionConfirmRequest.java", confirm);
  request.file("TransactionExecuteRequest.java", execute);
  request.file("TransactionModificationRequest.java", modification);
  request.file("TransactionSearchRequest.java", searchReq);
  request.file("TransactionSearchResponse.java", searchRes);

  const response = dtoFolder.folder("webhook");
  let webhook = WebhookRequest(projectName);
  response.file("WebhookRequest.java", webhook);
};

export const MakeEntity = (projectName, parentFolder) => {
  const entityFolder = parentFolder.folder("entity");
  let payment = Payment(projectName);
  let refund = Refund(projectName);

  entityFolder.file("Payment.java", payment);
  entityFolder.file("Refund.java", refund);
};

export const MakeException = (projectName, parentFolder) => {
  const exceptionFolder = parentFolder.folder("exception");
  const customExceptionHandler = CustomExceptionHandler(projectName);
  exceptionFolder.file("CustomExceptionHandler.java", customExceptionHandler);

  const customFolder = exceptionFolder.folder("customexceptions");
  let agencyResponse = AgencyResponseException(projectName);
  let errorExce = ErrorException(projectName);
  let resourceNotFound = ResourceNotFoundException(projectName);
  let resourceduplicated = ResourceDuplicationException(projectName);
  let serviceUnavailableException = ServiceUnavailableException(projectName);
  let timeout = TimeOutException(projectName);
  let unauth = UnauthorizedRequestException(projectName);
  let validation = ValidationException(projectName);

  customFolder.file("AgencyResponseException.java", agencyResponse);
  customFolder.file("ErrorException.java", errorExce);
  customFolder.file("ResourceDuplicationException.java", resourceduplicated);
  customFolder.file("ResourceNotFoundException.java", resourceNotFound);
  customFolder.file(
    "ServiceUnavailableException.java",
    serviceUnavailableException
  );
  customFolder.file("TimeOutException.java", timeout);
  customFolder.file("UnauthorizedRequestException.java", unauth);
  customFolder.file("ValidationException.java", validation);
};

export const MakeRepository = (projectName, parentFolder) => {
  const repositoryFolder = parentFolder.folder("repository");
  const payment = PaymentRepository(projectName);
  const refund = RefundRepository(projectName);

  repositoryFolder.file("PaymentRepository.java", payment);
  repositoryFolder.file("RefundRepository.java", refund);
};

export const MakeService = (projectName, parentFolder) => {
  const serviceFolder = parentFolder.folder("service");

  let kafkaFolder = serviceFolder.folder("kafka");
  let kafkaproducer = KafkaProducer(projectName);
  let topicLister = TopicLister(projectName);
  kafkaFolder.file("KafkaProducer.java", kafkaproducer);
  kafkaFolder.file("TopicLister.java", topicLister);

  let httpClient = serviceFolder.folder("webclient");
  let rsrq = RsRqHttpClientService(projectName);
  httpClient.file("RsRqHttpClientService.java", rsrq);

  let rqrshandler = serviceFolder.folder("rqrshandler");
  let impl = rqrshandler.folder("impl");

  let transactionCancel = TransactionCancelServiceImpl(projectName);
  let transactionConfirm = TransactionConfirmServiceImpl(projectName);
  let transactionExecute = TransactionExecuteServiceImpl(projectName);
  let transactionModification = TransactionModificationServiceImpl(projectName);
  let transactionSearch = TransactionCancelServiceImpl(projectName);

  impl.file("TransactionCancelServiceImpl.java", transactionCancel);
  impl.file("TransactionConfirmServiceImpl.java", transactionConfirm);
  impl.file("TransactionExecuteServiceImpl.java", transactionExecute);
  impl.file("TransactionModificationServiceImpl.java", transactionModification);
  impl.file("TransactionSearchServiceImpl.java", transactionSearch);

  let spec = rqrshandler.folder("spec");
  let abstractService = AbstractRefundService(projectName);
  let transactionConfirservice = TransactionConfirmService(projectName);
  let transactionExecutservice = TransactionExecuteService(projectName);
  let transactionModifiserviceation =
    TransactionModificationService(projectName);
  let transactionSearchservice = TransactionSearchService(projectName);

  spec.file("AbstractRefundService.java", abstractService);
  spec.file("TransactionConfirmService.java", transactionConfirservice);
  spec.file("TransactionExecuteService.java", transactionExecutservice);
  spec.file(
    "TransactionModificationService.java",
    transactionModifiserviceation
  );
  spec.file("TransactionSearchService.java", transactionSearchservice);
};
