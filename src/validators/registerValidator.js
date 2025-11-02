import { z } from "zod";

// Helper for common string validations
const nonEmptyString = (maxLength) => 
  z.string()
    .min(1, "Field is required")
    .max(maxLength, `Must be ${maxLength} characters or less`);

export const registerUserSchema = z.object({
  // Required Fields (Based on typical registration needs and primary key)
  userId: nonEmptyString(20), // Primary Key, mandatory
  userName: nonEmptyString(50), 
  password: z.string().min(8, "Password must be at least 8 characters long").max(300, "Password too long"), // Stronger validation for password
  firstName: nonEmptyString(50),
  lastName: nonEmptyString(100),
  msisdn: nonEmptyString(10).regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"), // Assuming MSISDN is a 10-digit mobile number
  emailId: z.string().email("Invalid email format").max(50, "Email too long").optional(),
  
  // Important System Fields (Required for system logic, but may be set by the system post-registration)
  categoryCode: z.string().max(10, "Category Code too long").optional(),
  userType: nonEmptyString(20),
  parentId: z.string().max(50, "Parent ID too long").optional(),
  ownerId: z.string().max(20, "Owner ID too long").optional(),
  
  // Address/KYC Fields (Optional but validated if present)
  firmName: z.string().max(50, "Firm name too long").optional(),
  city: z.string().max(200, "City name too long").optional(),
  state: z.string().max(20, "State name too long").optional(),
  district: z.string().max(20, "District name too long").optional(),
  address: z.string().optional(), // TEXT column, validation based on system constraints
  pincode: z.string().max(20, "Pincode too long").optional(),
  pan: z.string().max(50, "PAN too long").optional(),
  aadhaar: z.string().max(50, "Aadhaar too long").optional(),
  
  // Exclude fields typically managed by the database or internal logic (e.g., status, counts, dates)
}).strict("Request body contains unexpected fields");