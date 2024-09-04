export function KafkaProducer(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.kafka;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

/**
 * Genrate log message to Kafka
 */
@Service
@EnableAsync
public class KafkaProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    /**
     * Kafka send message to a specific topic
     * 
     * @param topic
     * @param messageId
     * @param message
     */
    @Async
    public void sendMessage(String topic, String messageId, String message) {
        ProducerRecord<String, String> producerRecord = new ProducerRecord<>(topic, messageId, message);
        kafkaTemplate.send(producerRecord);
    }
}
`;
}

export function TopicLister(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.service.kafka;

import org.springframework.stereotype.Component;

import com.adventure.${proName}.utils.constant.KafkaConstants;

/**
 * Kafka topic lists
 */
@Component
public class TopicLister {
    /**
     * List of kafka topics
     */
    public String[] getTopics() {
        return new String[] { KafkaConstants.WEBHOOK_PAYLOAD_TOPIC, KafkaConstants.WEBHOOK_PAYLOAD_FALLBACK_TOPIC };
    }
}

`;
}
