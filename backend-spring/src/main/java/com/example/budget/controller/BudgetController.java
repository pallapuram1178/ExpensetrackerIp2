package com.example.budget.controller;

import com.example.budget.dto.BudgetDTO;
import com.example.budget.dto.BudgetRequest;
import com.example.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdate(@Valid @RequestBody BudgetRequest req) {
        // In real app, derive userId from auth token; here we accept it in the request for simplicity
        return ResponseEntity.ok(budgetService.createOrUpdate(req));
    }

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> list(@RequestParam Long userId, @RequestParam String month) {
        return ResponseEntity.ok(budgetService.getBudgetsForUserAndMonth(userId, month));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestParam Long userId, @PathVariable Long id) {
        budgetService.deleteBudget(userId, id);
        return ResponseEntity.noContent().build();
    }
}
