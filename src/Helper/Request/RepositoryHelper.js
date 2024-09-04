export function PaymentRepository(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adventure.${proName}.entity.Payment;

/**
 * Payment List repository
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);
}
`;
}

export function RefundRepository(projectName) {
  let proName = projectName.toLowerCase() + "_rsrq";
  return `
package com.adventure.${proName}.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adventure.${proName}.entity.Refund;

/**
 * Refund repository
 */
@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    Refund findByPaymentId(Long paymentId);
}
`;
}
