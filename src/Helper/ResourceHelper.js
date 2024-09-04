export const generateConfigString = (projectName) => {
    const proj = projectName.toUpperCase();
    const projLowerCase = projectName.toLowerCase();
  
    return `
        #Application Name
        spring.application.name=${proj}
    
        #Server Port
        server.port=90
    
        #Adyen database Configuration
        spring.jpa.properties.hibernate.jdbc.time_zone=GMT
        spring.jpa.hibernate.ddl-auto=update
        spring.datasource.url=jdbc:mysql://\${${proj}_DB_URL}
        spring.datasource.username=\${${proj}_DB_USER}
        spring.datasource.password=\${${proj}_DB_PASSWORD}
        spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
        spring.jpa.show-sql: false
    
        # HikariCP settings
        spring.datasource.hikari.connection-timeout:\${DB_CONNECTION_TIMEOUT}
        spring.datasource.hikari.maximum-pool-size:\${DB_MAXIMUM_POOL_SIZE}
        spring.datasource.hikari.minimum-idle:\${DB_MINIMUM_IDLE}
        spring.datasource.hikari.max-lifetime:\${DB_MAX_LIFETIME}
        spring.datasource.hikari.idle-timeout:\${DB_IDLE_TIMEOUT}
    
        # Apache producer kafka configuration
        spring.kafka.producer.bootstrap-servers: \${GPB_KAFKA_URL}
        spring.kafka.producer.key-serializer: org.apache.kafka.common.serialization.StringSerializer
        spring.kafka.producer.value-serializer: org.apache.kafka.common.serialization.StringSerializer
    
        # ${projectName} config
        ${projLowerCase}.baseUrl=\${${proj}_BASE_URL}
        ${projLowerCase}.apikey=\${${proj}_API_KEY}
        ${projLowerCase}.merchantAccount=\${${proj}_MERCHANT_ACCOUNT}
        ${projLowerCase}.timeout=\${TIMEOUT_VALUE}
        ${projLowerCase}.webhook.host.baseUrl=\${${proj}_WEBHOOK_HOST_URL}
      `;
  };
  
  export const CreateResourceFolder = (
    parentFolder,
    projectName
  ) => {
    const resourcesFolder = parentFolder.folder("resources");
    const proj = projectName.toUpperCase();
  
    let data = generateConfigString(projectName)
    const applicationProp = `
      spring.profiles.active=\${${proj}_ENV}
      ${data}
      `;
   
    resourcesFolder.file("application.properties", applicationProp);
    resourcesFolder.file("application-test.properties", data);
    resourcesFolder.file("application-stag.properties", data);
    resourcesFolder.file("application-prod.properties", data);
  
  };
  