# Strapi Content Type Updates Required

## Event Content Type Updates

Please add the following fields to the Event content type in Strapi admin:

1. Registration Enable/Disable
   - Field Name: `registrationEnabled`
   - Type: Boolean
   - Default Value: false
   - Description: Toggle to enable/disable registration for this event

2. Early Bird Discount
   - Field Name: `earlyBirdDiscount`
   - Type: Component
   - Fields within component:
     - `enabled` (Boolean)
     - `discountAmount` (Decimal)
     - `endDate` (DateTime)
   - Description: Configuration for early bird discount pricing

3. End Time
   - Field Name: `endTime`
   - Type: DateTime
   - Required: true
   - Description: The end time/date of the event

## After Adding Fields
After adding these fields, please confirm the following:
1. The fields have been added successfully
2. You can create a test event with these new fields
3. The GraphQL schema has been updated to include these new fields

## Next Steps After Confirmation
Once you confirm the fields have been added, I will:
1. Update the frontend types to include these new fields
2. Add the fields to the GraphQL queries
3. Update the event components to display the new information

## Revision History
- **Date:** 2025-01-12
- **Description:** Initial content type update instructions
- **Author:** AI
