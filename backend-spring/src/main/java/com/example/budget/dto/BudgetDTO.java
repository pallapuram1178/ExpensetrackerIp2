package com.example.budget.dto;

public class BudgetDTO {
    private Long id;
    private String category;
    private String month;
    private Double amount; // budget amount
    private Double spent;  // total spent for that category+month

    public BudgetDTO() {}

    public BudgetDTO(Long id, String category, String month, Double amount, Double spent) {
        this.id = id;
        this.category = category;
        this.month = month;
        this.amount = amount;
        this.spent = spent;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Double getSpent() { return spent; }
    public void setSpent(Double spent) { this.spent = spent; }
    public Double getRemaining() { return (amount == null ? 0 : amount) - (spent == null ? 0 : spent); }
    public String getStatus() { return getRemaining() >= 0 ? "Under Budget" : "Over Budget"; }
    public int getProgressPercent() {
        double a = amount == null ? 0 : amount; double s = spent == null ? 0 : spent;
        if (a <= 0) return s <= 0 ? 0 : 100;
        int v = (int) Math.round(Math.min(100.0, (s / a) * 100.0));
        return v;
    }
}
