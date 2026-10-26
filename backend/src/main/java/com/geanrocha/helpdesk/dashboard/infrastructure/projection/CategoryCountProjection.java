package com.geanrocha.helpdesk.dashboard.infrastructure.projection;

import java.util.UUID;

public interface CategoryCountProjection {

    UUID getCategoryId();

    String getCategoryCode();

    String getCategoryName();

    long getTotal();
}
