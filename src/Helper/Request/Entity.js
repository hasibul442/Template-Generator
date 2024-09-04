export function Payment(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity of payments table
 */
@Entity
@Getter
@Setter
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("Payment id")
    private Long paymentId;

    @Column(unique = true)
    @Comment("Payment Agency provide reference no when we send response.")
    private String paymentPspReference;

    @Column(unique = true)
    @Comment("Payment Agency provide last transaction key.")
    private String pspReference;

    @Column(nullable = false, unique = true)
    @Comment("Order code is provided by Global Payment Base.")
    private String orderCode;

    @Comment("UserDevice like SP/PC/App")
    private String userDevice;

    @Comment("Transaction Token will provide by GPB")
    private String transactionToken;

    @Column(length = 5)
    @Comment("Status which represents the actual transactions condition.")
    private Integer status;

    @Comment("If any transaction is modified then the date is created ")
    private String approvedAt;

    @Column(length = 15)
    @Comment("The short format of currency which is provided by GBP site")
    private String currencyCd;

    @Column(columnDefinition = "Decimal(10,2) default '0.00' COMMENT 'Order price'")
    private BigDecimal price;

    @Column(columnDefinition = "Decimal(10,2) default '0.00' COMMENT 'Transaction price which is transmitted through out the process of any service'")
    private BigDecimal transactionPrice;

    @Column(columnDefinition = "Decimal(10,2) default '0.00' COMMENT 'Current price means after conducting any modification operation the remaining amount of price.'")
    private BigDecimal currentPrice;

    @Column(length = 50)
    @Comment("Customer email address")
    private String userMailAddress;

    @Comment("Phone number of the customer who made the payment")
    private String userTelNum;

    @Column(nullable = false)
    @Comment("Call back URL is provided by JPB")
    private String callbackUrl;

    @Column(nullable = false)
    @Comment("Its being used for keeping the track of the operation")
    private String currentOperation;

    @Comment("Keep tracking which microservice update the record")
    private String updatedBy;

    @Comment("Payment Method will provided by GPB")
    private String paymentMethod;

    @Comment("Language Code will provided by GPB")
    private String langCd;

    @Column(nullable = false)
    @Comment("GpbredirectURL is provided by GPB")
    private String gpbRedirectUrl;

    @Column(length = 1024)
    @Comment("Used to return subsequent Partial Refund Completed/Failed event notification")
    private String refundReferenceCodes;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @CreationTimestamp
    @Comment("When any data is created then it is created the date ")
    private LocalDateTime createdAt;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @Comment("When any data is updated then it is created the date ")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @Comment("When any data is deleted then it is created the date ")
    @UpdateTimestamp
    private LocalDateTime deletedAt;

}`;
}

export function Refund(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity of refunds table
 */
@Entity
@Getter
@Setter
@Table(name = "refunds")
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refundId;

    @ManyToOne
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private Payment payment;

    @Column(name = "payment_id", unique = true)
    @Comment("ID of the related payment")
    private Long paymentId;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime refundAt;

    @Column(nullable = false, columnDefinition = "Decimal(38,2) default '0.00'")
    @Comment("The amount which will be refunded")
    private BigDecimal amount;

    @Column(length = 20)
    @Comment("Currency Code Defined by Japan side")
    private String currencyCode;

    @Column(length = 3000)
    @Comment("The details of the refund will get from agency")
    private String refundDetails;

    @Column(length = 5)
    @Comment("Progress status of the specific refund process")
    private Integer status;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @CreationTimestamp
    @Comment("Its the refund creation date")
    private LocalDateTime createdAt;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @UpdateTimestamp
    @Comment("If any transaction is modified then the date is created ")
    private LocalDateTime updatedAt;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @Comment("When any data is deleted then it is created the date ")
    private LocalDateTime deletedAt;
}
`;
}
