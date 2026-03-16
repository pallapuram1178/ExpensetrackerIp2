package com.example.budget.service;

import com.example.budget.dto.BudgetDTO;
import com.example.budget.dto.BudgetRequest;
import com.example.budget.entity.Budget;
import com.example.budget.repository.BudgetRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    @PersistenceContext
    private EntityManager em;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Transactional
    public Budget createOrUpdate(BudgetRequest req) {
        // Unique index ensures uniqueness; repository logic finds existing budget for same user/category/month
        List<Budget> existing = budgetRepository.findByUserIdAndMonth(req.getUserId(), req.getMonth());
        Optional<Budget> match = existing.stream().filter(b -> b.getCategory().equalsIgnoreCase(req.getCategory())).findFirst();
        Budget b;
        if (match.isPresent()) {
            b = match.get();
            b.setAmount(req.getAmount());
        } else {
            b = new Budget();
            b.setUserId(req.getUserId());
            b.setCategory(req.getCategory());
            b.setMonth(req.getMonth());
            b.setAmount(req.getAmount());
        }
        return budgetRepository.save(b);
    }

    @Transactional(readOnly = true)
    public List<BudgetDTO> getBudgetsForUserAndMonth(Long userId, String month) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, month);
        // For each budget, compute total spent from expenses table via native query
        List<BudgetDTO> out = new ArrayList<>();
        for (Budget b : budgets) {
            Double spent = querySpentForUserCategoryMonth(userId, b.getCategory(), month);
            if (spent == null) spent = 0.0;
            out.add(new BudgetDTO(b.getId(), b.getCategory(), b.getMonth(), b.getAmount(), spent));
        }
        return out;
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Optional<Budget> opt = budgetRepository.findById(budgetId);
        if (opt.isPresent() && Objects.equals(opt.get().getUserId(), userId)) {
            budgetRepository.deleteById(budgetId);
        } else {
            throw new RuntimeException("Budget not found or not owned by user");
        }
    }

    private Double querySpentForUserCategoryMonth(Long userId, String category, String month) {
        // month in YYYY-MM -> compare using TO_CHAR(date,'YYYY-MM')
        // NOTE: this uses native SQL and assumes an `expenses` table exists with columns: user_id, category, amount, date
        String sql = "SELECT SUM(amount) FROM expenses e WHERE e.user_id = :userId AND e.category = :category AND TO_CHAR(e.date,'YYYY-MM') = :month";
        Query q = em.createNativeQuery(sql);
        q.setParameter("userId", userId);
        q.setParameter("category", category);
        q.setParameter("month", month);
        Object res = q.getSingleResult();
        if (res == null) return 0.0;
        if (res instanceof Number) return ((Number) res).doubleValue();
        return Double.valueOf(res.toString());
    }
}
