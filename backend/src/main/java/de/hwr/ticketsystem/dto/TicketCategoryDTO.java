package de.hwr.ticketsystem.dto;

import de.hwr.ticketsystem.model.TicketCategory;

/** Wire representation of a {@link de.hwr.ticketsystem.model.TicketCategory}. */
public class TicketCategoryDTO {
    private Long categoryId;
    private String categoryName;
    private String description;
    private Boolean isActive;

    public TicketCategoryDTO() {}

    public static TicketCategoryDTO fromEntity(TicketCategory category) {
        if (category == null) return null;
        TicketCategoryDTO dto = new TicketCategoryDTO();
        dto.categoryId = category.getCategoryId();
        dto.categoryName = category.getCategoryName();
        dto.description = category.getDescription();
        dto.isActive = category.getIsActive();
        return dto;
    }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
