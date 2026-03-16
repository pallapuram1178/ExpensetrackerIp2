package com.example.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public class BudgetRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String category;

    @NotBlank
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Month must be YYYY-MM")
    private String month;

    @NotNull
    @PositiveOrZero
    private Double amount;

    // getters / setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}
