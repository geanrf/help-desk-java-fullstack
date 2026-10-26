package com.geanrocha.helpdesk.dashboard.infrastructure.projection;

import java.util.UUID;

public interface TechnicianCountProjection {

    UUID getTechnicianId();

    String getTechnicianName();

    boolean getActive();

    long getTotal();
}
