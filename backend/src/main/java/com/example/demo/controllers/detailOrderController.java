package com.example.demo.controllers;

import com.example.demo.entity.DetailOrder;
import com.example.demo.services.detailOrder.detailOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detail_order")
@RequiredArgsConstructor
public class detailOrderController {

    private final detailOrderService detailOrderService;

    @GetMapping
    public List<DetailOrder> getAllDetailOrders() {
        return detailOrderService.getAllDetailOrders();
    }

    @GetMapping("/{id}")
    public Optional<DetailOrder> getDetailOrderById(@PathVariable Long id) {
        return detailOrderService.getDetailOrderById(id);
    }

    @GetMapping("/order/{orderid}")
    public List<DetailOrder> getAllDetailOrdersByOderId(@PathVariable Long orderid) {
        return detailOrderService.getDetailOrdersByOrderId(orderid);
    }

    @PostMapping
    public DetailOrder createDetailOrder(@RequestBody DetailOrder detailOrder) {
        return detailOrderService.createDetailOrder(detailOrder);
    }

    @PutMapping("/{id}")
    public DetailOrder updateDetailOrder(@PathVariable Long id, @RequestBody DetailOrder detailOrder) {
        return detailOrderService.updateDetailOrder(id, detailOrder);
    }

    @DeleteMapping("/{id}")
    public void deleteDetailOrder(@PathVariable Long id) {
        detailOrderService.deleteDetailOrder(id);
    }
}
