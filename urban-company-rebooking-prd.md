# Product Requirements Document (PRD)

## Product title
Urban Company One-Click Rebooking System

## Prepared for
Antigravity team project

## Product overview
Urban Company wants a one-click rebooking experience for repeat customers, where a new booking can be created from a past service without forcing the customer to re-enter the same information again. The system should reuse the same professional when possible, load customer details and booking history in parallel, and show professionals a calendar with blocked slots so invalid bookings are avoided.[cite:32][cite:33][cite:31]

This feature is intended to reduce repeat-booking friction, shorten task completion time, and improve schedule reliability for both customers and professionals.[cite:31][cite:32]

## Problem statement
Customers who already used a service often need the same service again, but standard booking flows can be repetitive and slow because they require repeated data entry and multiple confirmation steps. Rebooking tools are generally valuable because they copy earlier appointment details quickly, but they still depend on correct availability checks and clear scheduling rules.[cite:32][cite:31]

In this case, the core product problem has three parts:
- Repeat customers face unnecessary effort in recreating a familiar booking.[cite:32]
- Customer profile data and booking history must be retrieved quickly to support a smooth user experience, which makes parallel loading important.[cite:33]
- Professionals need a clear view of unavailable or blocked slots so rebookings do not create scheduling conflicts.[cite:31][cite:35]

## Goal
Build a rebooking system that allows a customer to rebook a previous service in one click, auto-fills known information, validates professional availability, and reduces booking completion effort without causing calendar conflicts.[cite:31][cite:32][cite:33]

## Objectives
- Reduce the number of steps required for repeat booking.[cite:32]
- Reuse historical service data to speed up booking creation.[cite:32]
- Load customer details and booking history simultaneously for better responsiveness.[cite:33]
- Prevent double-booking or invalid slot selection through blocked-slot visibility.[cite:31][cite:35]
- Improve customer confidence by preserving continuity with the same professional when available.[cite:32]

## Users
### Primary user: customer
A customer who has previously booked a service and wants to repeat the same or a very similar service with minimal effort.

### Secondary user: professional
A service professional who needs a dependable calendar view with blocked and unavailable slots clearly shown to avoid booking conflicts.[cite:31][cite:35]

### Operational user: admin or support team
An internal stakeholder who may need visibility into booking history, rebooking behavior, booking status, and failure reasons for support or operational monitoring.

## User stories
- As a customer, I want to rebook from a previous service in one click so that I do not need to manually enter the same details again.
- As a customer, I want my saved details and booking history to appear quickly so that I can confirm the booking confidently.
- As a customer, I want the same professional to be selected automatically when available so that I get continuity of service.
- As a professional, I want blocked and unavailable slots to be clearly visible so that I am not assigned overlapping or invalid bookings.[cite:31]
- As an admin, I want to track rebooking attempts and failures so that operational issues can be diagnosed.

## Scope
### In scope
- Rebook action from past service history.
- Automatic creation of a draft booking using the same service type and customer profile.
- Attempted assignment of the same professional from the previous booking.
- Parallel loading of customer details and booking history.[cite:33]
- Calendar view for professionals showing available and blocked slots.[cite:31][cite:35]
- Booking confirmation flow with validation and final success state.
- Error handling for unavailable professional or blocked slots.

### Out of scope
- Dynamic pricing engine changes.
- Professional recommendation engine beyond reusing the previous professional.
- Live chat between customer and professional.
- Payments redesign.
- Multi-service bundled rebooking in the first version.

## Functional requirements
### FR1. Rebook entry point
The system must provide a visible “Rebook” action on each eligible past service in the customer’s booking history.

### FR2. Draft booking creation
When the customer taps “Rebook,” the system must create a draft booking prefilled with:
- service type,
- service address if still valid,
- customer identity details,
- preferred professional from the earlier booking.[cite:32]

### FR3. Same professional preference
The system must attempt to assign the same professional as the previous booking. If that professional is unavailable, the system must show an alternative state such as:
- unavailable for selected window,
- choose another slot,
- choose another professional.

### FR4. Parallel data loading
The system must fetch customer details and booking history in parallel so the booking screen can render faster and avoid unnecessary waiting caused by sequential requests.[cite:33]

### FR5. Professional calendar visibility
The system must present a calendar or slot view for the professional where blocked, occupied, and unavailable time windows are clearly marked before final booking confirmation.[cite:31][cite:35]

### FR6. Slot validation
The system must validate slot availability again at confirmation time to prevent race conditions or double-booking.

### FR7. Booking confirmation
The customer must be able to review the booking summary and confirm the new booking.

### FR8. Error states
The system must handle at least these error cases:
- previous service no longer eligible for rebooking,
- same professional unavailable,
- slot blocked after initial selection,
- missing customer detail,
- server or network failure.

### FR9. Auditability
The system must store metadata for the rebooking event, such as source booking ID, selected professional, booking status, and timestamps.

## Non-functional requirements
- **Performance:** customer details and booking history should be fetched concurrently to reduce perceived waiting time.[cite:33]
- **Reliability:** the booking confirmation flow must avoid duplicate creation and scheduling conflicts.[cite:31]
- **Usability:** the rebooking path should require fewer steps than a fresh booking flow.[cite:32]
- **Scalability:** the system should support many rebooking requests during peak traffic periods.
- **Security:** authenticated access must be required for customer and professional views.
- **Observability:** booking failures and API latency should be trackable.

## Assumptions
- A previous booking record exists and is eligible for reuse.
- Customer profile data is already stored in the platform.
- Professional calendars maintain blocked, occupied, and open slots.[cite:31]
- Authentication and user role separation already exist or will be implemented in the selected stack.

## Constraints
The implementation should align with the required project stack shared for the Antigravity team:
- Next.js (App Router)
- React.js
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js (NextAuth) / JWT Authentication
- React Hook Form
- Zod
- Recharts
- Vercel [image:1]

## Proposed solution
### Customer flow
1. Customer opens past bookings.
2. Customer taps the “Rebook” button on a completed service.
3. System creates a draft booking using historical data.
4. Customer details and booking history are fetched in parallel.[cite:33]
5. System checks whether the same professional is available.
6. Customer sees available slots, with invalid or blocked slots excluded or marked clearly.[cite:31][cite:35]
7. Customer confirms booking.
8. System stores the booking and links it to the original booking ID.

### Professional flow
1. Professional opens work calendar.
2. Calendar displays booked, blocked, and available slots.
3. When a rebooking is confirmed, the calendar reflects the reserved slot.
4. Conflicts are prevented by server-side validation.[cite:31]

## UX requirements
- Rebook action should be accessible from booking history without deep navigation.
- The booking form should feel mostly prefilled rather than empty.
- Loading states should avoid full-screen blocking where possible because data is fetched in parallel.[cite:33]
- Blocked slots should be visually distinct from available slots.
- If the same professional is unavailable, the screen should explain why and offer the next best path.

## Success metrics
- Rebooking completion rate.
- Average time to complete a repeat booking.
- Drop-off rate after tapping “Rebook.”
- Percentage of rebookings completed with the same professional.
- Rate of booking conflicts prevented at validation stage.
- API latency for customer-details and booking-history fetches.

## Edge cases
- Previous professional has left the platform.
- Service is no longer offered in the customer’s location.
- Address changed or is now invalid.
- Customer wants the same service but a different time window.
- Customer taps rebook for a cancelled or disputed service.
- Slot becomes unavailable between first render and final confirmation.
- Parallel requests partially fail, for example customer data loads but booking history fails.[cite:33]

## Data model overview
### Suggested entities
- **User**: id, name, phone, email, address metadata, role
- **Professional**: id, name, skills, active status
- **Service**: id, category, price, duration, location rules
- **Booking**: id, userId, professionalId, serviceId, slotStart, slotEnd, status, sourceBookingId
- **CalendarSlot**: id, professionalId, startTime, endTime, slotType (available, blocked, booked)
- **RebookingEvent**: id, sourceBookingId, newBookingId, outcome, createdAt

## API requirements
### Customer-facing
- `GET /api/bookings/history`
- `POST /api/bookings/:id/rebook`
- `GET /api/customers/me`
- `GET /api/professionals/:id/availability?date=`
- `POST /api/bookings/confirm`

### Internal behavior
- Customer profile and booking history should be fetched concurrently in the server layer or client orchestration layer where appropriate.[cite:33]
- Availability must be checked again at confirmation time before final write.

## Technical implementation notes
### Frontend
- Use **Next.js App Router** for route structure and server components where suitable.
- Use **React.js** for interactive booking and calendar views.
- Use **Tailwind CSS** for UI styling and design consistency.
- Use **React Hook Form** with **Zod** for booking form handling and validation.[image:1]

### Backend and data
- Use **PostgreSQL** as the primary relational database.
- Use **Prisma ORM** for schema modeling and database access.
- Use **Auth.js (NextAuth) or JWT-based authentication** for secure role-based access.[image:1]

### Analytics and reporting
- Use **Recharts** for operational dashboards such as rebooking success rate, professional utilization, or blocked-slot analysis.[image:1]

### Deployment
- Deploy the application on **Vercel**.[image:1]

## Suggested milestones
| Milestone | Description |
|---|---|
| Week 1 | Finalize PRD, user flow, wireframes, and schema draft |
| Week 2 | Set up Next.js project, auth, database schema, and Prisma models |
| Week 3 | Build booking history and rebook trigger |
| Week 4 | Implement parallel data loading and draft booking flow |
| Week 5 | Build professional calendar with blocked-slot logic |
| Week 6 | Add validation, error handling, testing, and analytics widgets |
| Week 7 | Polish UI, prepare demo, deploy on Vercel |

## Risks and mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Same professional unavailable | Breaks expected continuity | Show fallback slot choices or alternate professional |
| Race condition during confirmation | Double booking or failed booking | Revalidate slot on final submit |
| Slow data fetching | Weak user experience | Fetch customer details and booking history in parallel[cite:33] |
| Incomplete historical data | Prefill may fail | Add editable confirmation step |
| Confusing slot UI | User errors | Use clear blocked/available visual states |

## Acceptance criteria
- Customer can initiate rebooking from at least one previous completed booking.
- Draft booking is created using historical service data.
- Customer details and booking history are loaded concurrently.[cite:33]
- Same professional is assigned when available.
- Blocked slots are visible and cannot be booked.[cite:31][cite:35]
- Final confirmation prevents invalid or double-booked time slots.[cite:31]
- Booking is stored with traceability to the original booking.
- Application runs on the required project stack.[image:1]

## Future enhancements
- Smart fallback recommendations when the same professional is unavailable.
- Personalized slot suggestions based on previous booking behavior.
- Push notifications and reminders for repeat services.
- Multi-service or recurring rebooking.
- ML-based rebooking likelihood prediction.
// sjbkbdka
