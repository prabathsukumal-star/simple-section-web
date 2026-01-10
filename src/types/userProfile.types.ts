// User Profile Types based on API specification
// GET /users/profile and PATCH /users/profile

export enum UserType {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  INSTITUTE_ADMIN = 'INSTITUTE_ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  ORGANIZATION_MANAGER = 'ORGANIZATION_MANAGER'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum Province {
  WESTERN = 'WESTERN',
  CENTRAL = 'CENTRAL',
  SOUTHERN = 'SOUTHERN',
  NORTHERN = 'NORTHERN',
  EASTERN = 'EASTERN',
  NORTH_WESTERN = 'NORTH_WESTERN',
  NORTH_CENTRAL = 'NORTH_CENTRAL',
  UVA = 'UVA',
  SABARAGAMUWA = 'SABARAGAMUWA'
}

export enum District {
  // Western Province
  COLOMBO = 'COLOMBO',
  GAMPAHA = 'GAMPAHA',
  KALUTARA = 'KALUTARA',
  // Central Province
  KANDY = 'KANDY',
  MATALE = 'MATALE',
  NUWARA_ELIYA = 'NUWARA_ELIYA',
  // Southern Province
  GALLE = 'GALLE',
  MATARA = 'MATARA',
  HAMBANTOTA = 'HAMBANTOTA',
  // Northern Province
  JAFFNA = 'JAFFNA',
  KILINOCHCHI = 'KILINOCHCHI',
  MANNAR = 'MANNAR',
  MULLAITIVU = 'MULLAITIVU',
  VAVUNIYA = 'VAVUNIYA',
  // Eastern Province
  AMPARA = 'AMPARA',
  BATTICALOA = 'BATTICALOA',
  TRINCOMALEE = 'TRINCOMALEE',
  // North Western Province
  KURUNEGALA = 'KURUNEGALA',
  PUTTALAM = 'PUTTALAM',
  // North Central Province
  ANURADHAPURA = 'ANURADHAPURA',
  POLONNARUWA = 'POLONNARUWA',
  // Uva Province
  BADULLA = 'BADULLA',
  MONARAGALA = 'MONARAGALA',
  // Sabaragamuwa Province
  RATNAPURA = 'RATNAPURA',
  KEGALLE = 'KEGALLE'
}

export enum PreferredLanguage {
  ENGLISH = 'ENGLISH',
  SINHALA = 'SINHALA',
  TAMIL = 'TAMIL'
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-'
}

/**
 * User Profile Response from GET /users/profile
 * Note: email and phoneNumber are MASKED in responses
 */
export interface UserProfileResponse {
  id: string;
  nameWithInitials: string;         // Always present
  email: string;                    // MASKED (e.g., "j***@example.com")
  phoneNumber?: string;             // MASKED (e.g., "+94****567")
  userType: UserType;
  imageUrl?: string;
  
  // Personal Information (Optional fields)
  nic?: string;
  birthCertificateNo?: string;
  dateOfBirth?: string;             // Format: "yyyy-MM-dd"
  gender?: Gender;
  
  // Address Information
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  
  // Additional Information
  preferredLanguage?: PreferredLanguage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // STUDENT specific fields
  studentId?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  
  // PARENT specific fields
  occupation?: string;
  workplace?: string;
  educationLevel?: string;
}

/**
 * Update Profile Request for PATCH /users/profile
 * IMPORTANT: Do NOT send email and phoneNumber (they are masked in responses)
 * IMPORTANT: Do NOT send addressLine2 unless user explicitly filled it
 */
export interface UpdateProfileRequest {
  // Personal Information
  nic?: string;                     // Optional, max 12 chars
  birthCertificateNo?: string;      // Optional, max 50 chars
  dateOfBirth?: string;             // Format: "yyyy-MM-dd"
  gender?: Gender;
  
  // Address Information
  addressLine1?: string;            // Optional, max 200 chars
  addressLine2?: string;            // Only if user fills it, max 200 chars
  city?: string;                    // Optional, max 50 chars
  district?: string;                // Optional (but recommended)
  province?: string;                // Optional (but recommended)
  postalCode?: string;              // Optional, max 6 chars
  country?: string;                 // Optional, default: SRI_LANKA
  
  // Additional Settings
  preferredLanguage?: PreferredLanguage;
  
  // STUDENT specific fields
  emergencyContact?: string;        // Optional, 10-15 chars
  bloodGroup?: string;              // Optional
  
  // PARENT specific fields
  occupation?: string;              // Optional, max 100 chars
  workplace?: string;               // Optional, max 100 chars
  educationLevel?: string;          // Optional
}

/**
 * Read-only fields that cannot be edited via profile update
 */
export const READ_ONLY_FIELDS = [
  'id',
  'nameWithInitials',
  'email',           // Masked
  'phoneNumber',     // Masked
  'userType',
  'studentId',       // System generated
  'isActive',
  'createdAt',
  'updatedAt'
] as const;

/**
 * Editable fields that can be updated
 */
export const EDITABLE_FIELDS = [
  'nic',
  'birthCertificateNo',
  'dateOfBirth',
  'gender',
  'addressLine1',
  'addressLine2',
  'city',
  'district',
  'province',
  'postalCode',
  'country',
  'preferredLanguage',
  'emergencyContact',    // Student only
  'bloodGroup',          // Student only
  'occupation',          // Parent only
  'workplace',           // Parent only
  'educationLevel'       // Parent only
] as const;

/**
 * Type-specific fields visibility
 */
export const TYPE_SPECIFIC_FIELDS: Record<UserType, string[]> = {
  [UserType.STUDENT]: ['studentId', 'emergencyContact', 'bloodGroup'],
  [UserType.PARENT]: ['occupation', 'workplace', 'educationLevel'],
  [UserType.TEACHER]: [],
  [UserType.INSTITUTE_ADMIN]: [],
  [UserType.SUPERADMIN]: [],
  [UserType.ORGANIZATION_MANAGER]: []
};

/**
 * Field groups for UI organization
 */
export const FIELD_GROUPS = {
  'Account Information': [
    'nameWithInitials',
    'email',
    'phoneNumber',
    'userType'
  ],
  'Personal Information': [
    'nic',
    'birthCertificateNo',
    'dateOfBirth',
    'gender'
  ],
  'Address Information': [
    'addressLine1',
    'addressLine2',
    'city',
    'district',
    'province',
    'postalCode',
    'country'
  ],
  'Student Information': [     // Show only if userType === 'STUDENT'
    'studentId',
    'emergencyContact',
    'bloodGroup'
  ],
  'Parent Information': [      // Show only if userType === 'PARENT'
    'occupation',
    'workplace',
    'educationLevel'
  ],
  'Settings': [
    'preferredLanguage'
  ]
} as const;

/**
 * Province to Districts mapping
 */
export const PROVINCE_DISTRICTS: Record<Province, District[]> = {
  [Province.WESTERN]: [District.COLOMBO, District.GAMPAHA, District.KALUTARA],
  [Province.CENTRAL]: [District.KANDY, District.MATALE, District.NUWARA_ELIYA],
  [Province.SOUTHERN]: [District.GALLE, District.MATARA, District.HAMBANTOTA],
  [Province.NORTHERN]: [District.JAFFNA, District.KILINOCHCHI, District.MANNAR, District.MULLAITIVU, District.VAVUNIYA],
  [Province.EASTERN]: [District.AMPARA, District.BATTICALOA, District.TRINCOMALEE],
  [Province.NORTH_WESTERN]: [District.KURUNEGALA, District.PUTTALAM],
  [Province.NORTH_CENTRAL]: [District.ANURADHAPURA, District.POLONNARUWA],
  [Province.UVA]: [District.BADULLA, District.MONARAGALA],
  [Province.SABARAGAMUWA]: [District.RATNAPURA, District.KEGALLE]
};
