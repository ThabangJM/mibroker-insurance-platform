import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, User, Phone, Mail, Car, Home as HomeIcon, Shield, Building, CheckCircle, AlertCircle, Eye, FileText, AlertTriangle, Package, Mountain, Calendar } from 'lucide-react';
import { InsuranceType, Representative } from '../types';

// Interface defining the props that the QuoteForm component expects
interface QuoteFormProps {
  insuranceType: InsuranceType;    // The type of insurance being quoted
  onSubmit: (data: any) => void;   // Callback function when form is submitted
  onBack: () => void;              // Callback function when user goes back
  loading?: boolean;               // Optional loading state
  assignedRepresentative?: Representative | null; // Optional assigned representative
}

// Enhanced interface for needs analysis data
interface NeedsAnalysisData {
  // Current situation assessment
  currentSituation: {
    hasExistingInsurance: boolean;
    currentProvider?: string;
    policyNumber?: string;
    policyStartDate?: string;
    claimsHistory: {
      hasClaimsLastThreeYears: boolean;
      numberOfClaims?: number;
      totalClaimAmount?: number;
      damageType?: string;
      damageTypeOther?: string;
      incidentDescription?: string;
      multipleClaimsExplanation?: string;
    };
  };
  
  // Coverage preferences
  coveragePreferences: {
    preferredExcess: string;
    coverageLevel: 'basic' | 'comprehensive' | 'premium' | 'third-party-theft' | 'third-party-only';
    additionalCoverage: string[];
    additionalCoverRequirements?: string;
  };
  
  // Driver details (for auto insurance)
  driverDetails?: {
    licenceType: 'rsa-drivers' | 'rsa-learners' | 'international';
    licenceFirstIssued: string;
    yearsSinceLastClaim: string;
    driversUnder25: boolean;
  };
  
  // Risk factors (insurance-type specific)
  riskFactors: {
    [key: string]: any;
  };
  
  // Budget and priorities
  budgetPreferences: {
    maxMonthlyPremium: number;
    prioritizePrice: boolean;
    priorityFactors: string[];
  };
}

// Interface defining the structure of the form data
interface FormData {
  // Personal information section
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    maritalStatus: string;
    occupation: string;
    // Physical address
    streetNumber: string;
    streetName: string;
    village: string;
    areaCode: string;
    province: string;
    country: string;
    countryOther?: string; // For when "other" country is selected
  };
  
  // Company information section (for business insurance types)
  companyInfo: {
    companyName: string;
    registrationNumber: string;
    vatNumber: string;
    businessType: string;
    businessTypeOther?: string; // For when "other" business type is selected
    industryType: string;
    industryTypeOther?: string; // For when "other" industry is selected
    yearEstablished: string;
    numberOfEmployees: string;
    // Contact information
    email: string;
    phone: string;
    alternativePhone?: string;
    // Physical address
    streetNumber: string;
    streetName: string;
    village: string;
    areaCode: string;
    province: string;
    country: string;
    countryOther?: string; // For when "other" country is selected
    // Contact person
    contactPersonName: string;
    contactPersonPosition: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
  };
  
  // Co-insured information (optional)
  coInsured?: {
    hasCoInsured: boolean;
    firstName: string;
    lastName: string;
    idNumber: string;
    phone: string;
    email: string;
    relationship: string;
    relationshipOther?: string; // For when "other" relationship is selected
    sameAddress: boolean;
    // Address fields (only if sameAddress is false)
    streetNumber?: string;
    streetName?: string;
    village?: string;
    areaCode?: string;
    province?: string;
    country?: string;
    countryOther?: string; // For when "other" country is selected
  };
  
  // Needs analysis data
  needsAnalysis: NeedsAnalysisData;
  
  // Insurance-specific information (varies by insurance type)
  insuranceInfo: {
    [key: string]: any;
  };
  
  // Engineering & Construction specific fields
  projectName?: string;
  projectLocation?: string;
  contractValue?: string;
  projectDuration?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  principalName?: string;
  projectDescription?: string;
  constructionType?: string;
  constructionTypeOther?: string;
  constructionMethod?: string;
  maxHeight?: string;
  maxDepth?: string;
  specialRisks?: string[];
  additionalConstructionDetails?: string;
}


export function QuoteForm({ insuranceType, onSubmit, onBack, loading = false, assignedRepresentative }: QuoteFormProps) {
  // State to store all form data across multiple steps, including consent
  const [formData, setFormData] = useState<FormData & { 
    consentGiven: boolean; 
    consentTimestamp?: string;
    digitalSignature?: string; // Base64 encoded signature data or file data
    signatureType?: 'drawn' | 'uploaded';
    signatureFileName?: string; // For uploaded files
  }>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: '',
      maritalStatus: '',
      occupation: '',
      streetNumber: '',
      streetName: '',
      village: '',
      areaCode: '',
      province: '',
      country: '',
      countryOther: '',
    },
    companyInfo: {
      companyName: '',
      registrationNumber: '',
      vatNumber: '',
      businessType: '',
      businessTypeOther: '',
      industryType: '',
      industryTypeOther: '',
      yearEstablished: '',
      numberOfEmployees: '',
      email: '',
      phone: '',
      alternativePhone: '',
      streetNumber: '',
      streetName: '',
      village: '',
      areaCode: '',
      province: '',
      country: '',
      countryOther: '',
      contactPersonName: '',
      contactPersonPosition: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
    },
    coInsured: {
      hasCoInsured: false,
      firstName: '',
      lastName: '',
      idNumber: '',
      phone: '',
      email: '',
      relationship: '',
      relationshipOther: '',
      sameAddress: true,
      streetNumber: '',
      streetName: '',
      village: '',
      areaCode: '',
      province: '',
      country: '',
      countryOther: '',
    },
    needsAnalysis: {
      currentSituation: {
        hasExistingInsurance: false,
        claimsHistory: {
          hasClaimsLastThreeYears: false
        }
      },
      coveragePreferences: {
        preferredExcess: '',
        coverageLevel: 'comprehensive',
        additionalCoverage: []
      },
      driverDetails: insuranceType === 'auto' ? {
        licenceType: 'rsa-drivers',
        licenceFirstIssued: '',
        yearsSinceLastClaim: '',
        driversUnder25: false
      } : undefined,
      riskFactors: {},
      budgetPreferences: {
        maxMonthlyPremium: 0,
        prioritizePrice: true,
        priorityFactors: []
      }
    },
    insuranceInfo: {},
    consentGiven: false,
    consentTimestamp: undefined,
    digitalSignature: undefined,
    signatureType: undefined,
    signatureFileName: undefined,
    
    // Engineering & Construction fields initialization
    projectName: '',
    projectLocation: '',
    contractValue: '',
    projectDuration: '',
    projectStartDate: '',
    projectEndDate: '',
    principalName: '',
    projectDescription: '',
    constructionType: '',
    constructionTypeOther: '',
    constructionMethod: '',
    maxHeight: '',
    maxDepth: '',
    specialRisks: [],
    additionalConstructionDetails: '',
  });

  // Validation state to track field errors
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Signature-related state
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration for form steps based on insurance type
  const getStepsForInsuranceType = (type: InsuranceType) => {
    const personalBaseSteps = [
      { id: 'personal', title: 'Personal Information', icon: User },
      { id: 'current-situation', title: 'Current Situation', icon: AlertCircle },
      { id: 'coverage-needs', title: 'Coverage Needs', icon: Shield },
    ];
    
    const businessBaseSteps = [
      { id: 'company', title: 'Company Information', icon: Building },
      { id: 'current-situation', title: 'Current Situation', icon: AlertCircle },
      { id: 'coverage-needs', title: 'Coverage Needs', icon: Shield },
    ];
    
    // Add insurance-specific steps
    switch (type) {
      case 'auto':
        return [
          ...personalBaseSteps,
          { id: 'vehicle-details', title: 'Vehicle Details', icon: Car },
          { id: 'driver-details', title: 'Driver Details', icon: User },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'buildings-insurance':
        return [
          ...personalBaseSteps,
          { id: 'property-details', title: 'Buildings Details', icon: HomeIcon },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'household-contents':
        return [
          ...personalBaseSteps,
          { id: 'property-details', title: 'Contents Details', icon: Package },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'public-liability':
        return [
          ...businessBaseSteps,
          { id: 'business-details', title: 'Business Details', icon: Building },
          { id: 'liability-details', title: 'Liability Coverage', icon: Shield },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'small-business':
        return [
          ...businessBaseSteps,
          { id: 'business-details', title: 'Business Details', icon: Building },
          { id: 'business-assets', title: 'Business Assets', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'commercial-property':
        return [
          ...businessBaseSteps,
          { id: 'property-details', title: 'Property Details', icon: Building },
          { id: 'property-usage', title: 'Property Usage', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'transport-insurance':
        return [
          ...personalBaseSteps,
          { id: 'fleet-details', title: 'Fleet Details', icon: Car },
          { id: 'transport-operations', title: 'Operations Details', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'body-corporates':
        return [
          ...personalBaseSteps,
          { id: 'scheme-details', title: 'Scheme Details', icon: Building },
          { id: 'common-areas', title: 'Common Areas', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'engineering-construction':
        return [
          ...personalBaseSteps,
          { id: 'project-details', title: 'Project Details', icon: Building },
          { id: 'construction-type', title: 'Construction Type', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'aviation-marine':
        return [
          ...personalBaseSteps,
          { id: 'asset-details', title: 'Asset Details', icon: Building },
          { id: 'operations', title: 'Operations Details', icon: Building },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'mining-rehabilitation':
        return [
          ...personalBaseSteps,
          { id: 'business-details', title: 'Mining Operation Details', icon: Mountain },
          { id: 'asset-details', title: 'Rehabilitation Requirements', icon: Building },
          { id: 'risk-factors', title: 'Environmental Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      case 'e-hailing':
        return [
          ...personalBaseSteps,
          { id: 'vehicle-details', title: 'Vehicle Details', icon: Car },
          { id: 'e-hailing-details', title: 'E-Hailing Details', icon: Car },
          { id: 'driver-details', title: 'Driver Details', icon: User },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
      default:
        return [
          ...personalBaseSteps,
          { id: 'insurance-details', title: 'Insurance Details', icon: Shield },
          { id: 'risk-factors', title: 'Risk Assessment', icon: CheckCircle },
          { id: 'preferences', title: 'Preferences & Budget', icon: Building },
          { id: 'review', title: 'Review Information', icon: Eye },
          { id: 'disclosure', title: 'FAIS Disclosure', icon: FileText },
          { id: 'consent', title: 'Consent', icon: CheckCircle },
        ];
    }
  };

  const steps = getStepsForInsuranceType(insuranceType);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;

  // Function to update form data for a specific section and field
  const updateFormData = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null ? {
        ...prev[section],
        [field]: value,
      } : {
        [field]: value,
      },
    }));
    
    // Clear validation error when user starts typing
    const errorKey = `${section}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  };

  // Signature handling functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSignature(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawingSignature) {
      setIsDrawingSignature(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        setFormData(prev => ({
          ...prev,
          digitalSignature: signatureData,
          signatureType: 'drawn'
        }));
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setFormData(prev => ({
      ...prev,
      digitalSignature: undefined,
      signatureType: undefined,
      signatureFileName: undefined
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          digitalSignature: base64Data,
          signatureType: 'uploaded',
          signatureFileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid South African phone number';
    }
    return null;
  };

  const validateSAIdNumber = (idNumber: string): string | null => {
    if (!idNumber.trim()) return 'ID number is required';
    const idRegex = /^[0-9]{13}$/;
    if (!idRegex.test(idNumber)) return 'ID number must be 13 digits';
    
    // Basic Luhn algorithm check for SA ID numbers
    const digits = idNumber.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i];
      } else {
        const doubled = digits[i] * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      }
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    if (checkDigit !== digits[12]) {
      return 'Please enter a valid South African ID number';
    }
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    return null;
  };

  const validateNumber = (value: string, fieldName: string, min?: number, max?: number): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return `${fieldName} must be a valid number`;
    if (min !== undefined && numValue < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && numValue > max) return `${fieldName} must not exceed ${max}`;
    return null;
  };

  // Step validation functions
  const validatePersonalInfo = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const firstNameError = validateRequired(formData.personalInfo.firstName, 'First name');
    if (firstNameError) errors['personalInfo.firstName'] = firstNameError;
    
    const lastNameError = validateRequired(formData.personalInfo.lastName, 'Last name');
    if (lastNameError) errors['personalInfo.lastName'] = lastNameError;
    
    const emailError = validateEmail(formData.personalInfo.email);
    if (emailError) errors['personalInfo.email'] = emailError;
    
    const phoneError = validatePhone(formData.personalInfo.phone);
    if (phoneError) errors['personalInfo.phone'] = phoneError;
    
    const idError = validateSAIdNumber(formData.personalInfo.idNumber);
    if (idError) errors['personalInfo.idNumber'] = idError;
    
    // New field validations
    const maritalStatusError = validateRequired(formData.personalInfo.maritalStatus, 'Marital status');
    if (maritalStatusError) errors['personalInfo.maritalStatus'] = maritalStatusError;
    
    const occupationError = validateRequired(formData.personalInfo.occupation, 'Occupation');
    if (occupationError) errors['personalInfo.occupation'] = occupationError;
    
    // Physical address validations
    const streetNumberError = validateRequired(formData.personalInfo.streetNumber, 'Street number');
    if (streetNumberError) errors['personalInfo.streetNumber'] = streetNumberError;
    
    const streetNameError = validateRequired(formData.personalInfo.streetName, 'Street name');
    if (streetNameError) errors['personalInfo.streetName'] = streetNameError;
    
    const villageError = validateRequired(formData.personalInfo.village, 'Village/City');
    if (villageError) errors['personalInfo.village'] = villageError;
    
    const areaCodeError = validateRequired(formData.personalInfo.areaCode, 'Area code');
    if (areaCodeError) errors['personalInfo.areaCode'] = areaCodeError;
    else if (!/^\d{4}$/.test(formData.personalInfo.areaCode)) {
      errors['personalInfo.areaCode'] = 'Area code must be 4 digits';
    }
    
    const provinceError = validateRequired(formData.personalInfo.province, 'Province');
    if (provinceError) errors['personalInfo.province'] = provinceError;
    
    const countryError = validateRequired(formData.personalInfo.country, 'Country');
    if (countryError) errors['personalInfo.country'] = countryError;
    
    // Validate country other specification if "other" is selected
    if (formData.personalInfo.country === 'other') {
      const countryOtherError = validateRequired(formData.personalInfo.countryOther || '', 'Country specification');
      if (countryOtherError) errors['personalInfo.countryOther'] = countryOtherError;
    }
    
    // Co-insured validations (if co-insured is added)
    if (formData.coInsured?.hasCoInsured) {
      const coFirstNameError = validateRequired(formData.coInsured.firstName, 'Co-insured first name');
      if (coFirstNameError) errors['coInsured.firstName'] = coFirstNameError;
      
      const coLastNameError = validateRequired(formData.coInsured.lastName, 'Co-insured last name');
      if (coLastNameError) errors['coInsured.lastName'] = coLastNameError;
      
      const coIdError = validateSAIdNumber(formData.coInsured.idNumber);
      if (coIdError) errors['coInsured.idNumber'] = coIdError;
      
      const coPhoneError = validatePhone(formData.coInsured.phone);
      if (coPhoneError) errors['coInsured.phone'] = coPhoneError;
      
      const coEmailError = validateEmail(formData.coInsured.email);
      if (coEmailError) errors['coInsured.email'] = coEmailError;
      
      const coRelationshipError = validateRequired(formData.coInsured.relationship, 'Relationship to client');
      if (coRelationshipError) errors['coInsured.relationship'] = coRelationshipError;
      
      // Validate relationship other specification if "other" is selected
      if (formData.coInsured.relationship === 'other') {
        const relationshipOtherError = validateRequired(formData.coInsured.relationshipOther || '', 'Relationship specification');
        if (relationshipOtherError) errors['coInsured.relationshipOther'] = relationshipOtherError;
      }
      
      // Validate co-insured address if different from client
      if (!formData.coInsured.sameAddress) {
        const coStreetNumberError = validateRequired(formData.coInsured.streetNumber || '', 'Co-insured street number');
        if (coStreetNumberError) errors['coInsured.streetNumber'] = coStreetNumberError;
        
        const coStreetNameError = validateRequired(formData.coInsured.streetName || '', 'Co-insured street name');
        if (coStreetNameError) errors['coInsured.streetName'] = coStreetNameError;
        
        const coVillageError = validateRequired(formData.coInsured.village || '', 'Co-insured village/city');
        if (coVillageError) errors['coInsured.village'] = coVillageError;
        
        const coAreaCodeError = validateRequired(formData.coInsured.areaCode || '', 'Co-insured area code');
        if (coAreaCodeError) errors['coInsured.areaCode'] = coAreaCodeError;
        else if (formData.coInsured.areaCode && !/^\d{4}$/.test(formData.coInsured.areaCode)) {
          errors['coInsured.areaCode'] = 'Area code must be 4 digits';
        }
        
        const coProvinceError = validateRequired(formData.coInsured.province || '', 'Co-insured province');
        if (coProvinceError) errors['coInsured.province'] = coProvinceError;
        
        const coCountryError = validateRequired(formData.coInsured.country || '', 'Co-insured country');
        if (coCountryError) errors['coInsured.country'] = coCountryError;
        
        // Validate co-insured country other specification if "other" is selected
        if (formData.coInsured.country === 'other') {
          const countryOtherError = validateRequired(formData.coInsured.countryOther || '', 'Co-insured country specification');
          if (countryOtherError) errors['coInsured.countryOther'] = countryOtherError;
        }
      }
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  const validateCompanyInfo = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const companyNameError = validateRequired(formData.companyInfo.companyName, 'Company name');
    if (companyNameError) errors['companyInfo.companyName'] = companyNameError;
    
    const registrationNumberError = validateRequired(formData.companyInfo.registrationNumber, 'Registration number');
    if (registrationNumberError) errors['companyInfo.registrationNumber'] = registrationNumberError;
    
    const vatNumberError = validateRequired(formData.companyInfo.vatNumber, 'VAT number');
    if (vatNumberError) errors['companyInfo.vatNumber'] = vatNumberError;
    
    const businessTypeError = validateRequired(formData.companyInfo.businessType, 'Business type');
    if (businessTypeError) errors['companyInfo.businessType'] = businessTypeError;
    
    // Validate business type other specification if "other" is selected
    if (formData.companyInfo.businessType === 'other') {
      const businessTypeOtherError = validateRequired(formData.companyInfo.businessTypeOther || '', 'Business type specification');
      if (businessTypeOtherError) errors['companyInfo.businessTypeOther'] = businessTypeOtherError;
    }
    
    const industryTypeError = validateRequired(formData.companyInfo.industryType, 'Industry type');
    if (industryTypeError) errors['companyInfo.industryType'] = industryTypeError;
    
    // Validate industry type other specification if "other" is selected
    if (formData.companyInfo.industryType === 'other') {
      const industryTypeOtherError = validateRequired(formData.companyInfo.industryTypeOther || '', 'Industry type specification');
      if (industryTypeOtherError) errors['companyInfo.industryTypeOther'] = industryTypeOtherError;
    }
    
    const yearEstablishedError = validateRequired(formData.companyInfo.yearEstablished, 'Year established');
    if (yearEstablishedError) errors['companyInfo.yearEstablished'] = yearEstablishedError;
    else if (!/^\d{4}$/.test(formData.companyInfo.yearEstablished)) {
      errors['companyInfo.yearEstablished'] = 'Year must be 4 digits';
    } else {
      const year = parseInt(formData.companyInfo.yearEstablished);
      const currentYear = new Date().getFullYear();
      if (year < 1800 || year > currentYear) {
        errors['companyInfo.yearEstablished'] = `Year must be between 1800 and ${currentYear}`;
      }
    }
    
    const numberOfEmployeesError = validateRequired(formData.companyInfo.numberOfEmployees, 'Number of employees');
    if (numberOfEmployeesError) errors['companyInfo.numberOfEmployees'] = numberOfEmployeesError;
    
    const emailError = validateEmail(formData.companyInfo.email);
    if (emailError) errors['companyInfo.email'] = emailError;
    
    const phoneError = validatePhone(formData.companyInfo.phone);
    if (phoneError) errors['companyInfo.phone'] = phoneError;
    
    // Alternative phone is optional, but if provided should be valid
    if (formData.companyInfo.alternativePhone?.trim()) {
      const altPhoneError = validatePhone(formData.companyInfo.alternativePhone);
      if (altPhoneError) errors['companyInfo.alternativePhone'] = altPhoneError;
    }
    
    // Physical address validations
    const streetNumberError = validateRequired(formData.companyInfo.streetNumber, 'Street number');
    if (streetNumberError) errors['companyInfo.streetNumber'] = streetNumberError;
    
    const streetNameError = validateRequired(formData.companyInfo.streetName, 'Street name');
    if (streetNameError) errors['companyInfo.streetName'] = streetNameError;
    
    const villageError = validateRequired(formData.companyInfo.village, 'Village/City');
    if (villageError) errors['companyInfo.village'] = villageError;
    
    const areaCodeError = validateRequired(formData.companyInfo.areaCode, 'Area code');
    if (areaCodeError) errors['companyInfo.areaCode'] = areaCodeError;
    else if (!/^\d{4}$/.test(formData.companyInfo.areaCode)) {
      errors['companyInfo.areaCode'] = 'Area code must be 4 digits';
    }
    
    const provinceError = validateRequired(formData.companyInfo.province, 'Province');
    if (provinceError) errors['companyInfo.province'] = provinceError;
    
    const countryError = validateRequired(formData.companyInfo.country, 'Country');
    if (countryError) errors['companyInfo.country'] = countryError;
    
    // Validate country other specification if "other" is selected
    if (formData.companyInfo.country === 'other') {
      const countryOtherError = validateRequired(formData.companyInfo.countryOther || '', 'Country specification');
      if (countryOtherError) errors['companyInfo.countryOther'] = countryOtherError;
    }
    
    // Contact person validations
    const contactPersonNameError = validateRequired(formData.companyInfo.contactPersonName, 'Contact person name');
    if (contactPersonNameError) errors['companyInfo.contactPersonName'] = contactPersonNameError;
    
    const contactPersonPositionError = validateRequired(formData.companyInfo.contactPersonPosition, 'Contact person position');
    if (contactPersonPositionError) errors['companyInfo.contactPersonPosition'] = contactPersonPositionError;
    
    const contactPersonEmailError = validateEmail(formData.companyInfo.contactPersonEmail);
    if (contactPersonEmailError) errors['companyInfo.contactPersonEmail'] = contactPersonEmailError;
    
    const contactPersonPhoneError = validatePhone(formData.companyInfo.contactPersonPhone);
    if (contactPersonPhoneError) errors['companyInfo.contactPersonPhone'] = contactPersonPhoneError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  const validateCurrentSituation = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // If has existing insurance, provider is required
    if (formData.needsAnalysis.currentSituation.hasExistingInsurance) {
      if (!formData.needsAnalysis.currentSituation.currentProvider?.trim()) {
        errors['needsAnalysis.currentSituation.currentProvider'] = 'Current provider is required';
      }
      // For car insurance, policy number is required when has existing insurance
      if (insuranceType === 'auto' && !formData.needsAnalysis.currentSituation.policyNumber?.trim()) {
        errors['needsAnalysis.currentSituation.policyNumber'] = 'Policy number is required';
      }
    }
    
    // If has claims, number of claims, total amount, damage type and incident description are required
    if (formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears) {
      if (!formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims) {
        errors['needsAnalysis.currentSituation.claimsHistory.numberOfClaims'] = 'Number of claims is required';
      }
      if (!formData.needsAnalysis.currentSituation.claimsHistory.totalClaimAmount) {
        errors['needsAnalysis.currentSituation.claimsHistory.totalClaimAmount'] = 'Total claim amount is required';
      }
      if (!formData.needsAnalysis.currentSituation.claimsHistory.damageType) {
        errors['needsAnalysis.currentSituation.claimsHistory.damageType'] = 'Type of damage is required';
      }
      if (formData.needsAnalysis.currentSituation.claimsHistory.damageType === 'other' && 
          !formData.needsAnalysis.currentSituation.claimsHistory.damageTypeOther?.trim()) {
        errors['needsAnalysis.currentSituation.claimsHistory.damageTypeOther'] = 'Please specify the type of damage';
      }
      if (!formData.needsAnalysis.currentSituation.claimsHistory.incidentDescription?.trim()) {
        errors['needsAnalysis.currentSituation.claimsHistory.incidentDescription'] = 'Incident description is required';
      }
      // If 2 or more claims, explanation is required
      if (formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims && 
          formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims >= 2 &&
          !formData.needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation?.trim()) {
        errors['needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation'] = 'Explanation is required for multiple claims';
      }
    }
    
    // Clear any claim-related errors if no claims
    if (!formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.numberOfClaims'];
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.totalClaimAmount'];
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.damageType'];
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.damageTypeOther'];
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.incidentDescription'];
        delete newErrors['needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation'];
        return newErrors;
      });
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  const validateCoverageNeeds = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.needsAnalysis.coveragePreferences.coverageLevel) {
      errors['needsAnalysis.coveragePreferences.coverageLevel'] = 'Coverage level is required';
    }
    
    if (!formData.needsAnalysis.coveragePreferences.preferredExcess) {
      errors['needsAnalysis.coveragePreferences.preferredExcess'] = 'Preferred excess is required';
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  const validatePreferences = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (formData.needsAnalysis.budgetPreferences.maxMonthlyPremium <= 0) {
      errors['needsAnalysis.budgetPreferences.maxMonthlyPremium'] = 'Maximum monthly premium must be greater than 0';
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Engineering & Construction specific validation
  const validateEngineeringConstruction = (): boolean => {
    if (insuranceType !== 'engineering-construction') return true;
    
    const errors: {[key: string]: string} = {};
    
    const projectNameError = validateRequired(formData.projectName || '', 'Project name');
    if (projectNameError) errors['projectName'] = projectNameError;
    
    const locationError = validateRequired(formData.projectLocation || '', 'Project location');
    if (locationError) errors['projectLocation'] = locationError;
    
    const contractValueError = validateNumber(formData.contractValue || '', 'Contract value', 1);
    if (contractValueError) errors['contractValue'] = contractValueError;
    
    const durationError = validateNumber(formData.projectDuration || '', 'Project duration', 1);
    if (durationError) errors['projectDuration'] = durationError;
    
    const principalError = validateRequired(formData.principalName || '', 'Principal name');
    if (principalError) errors['principalName'] = principalError;
    
    if (!formData.constructionType) {
      errors['constructionType'] = 'Construction type is required';
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Vehicle details validation (for auto insurance)
  const validateVehicleDetails = (): boolean => {
    if (insuranceType !== 'auto') return true;
    
    const errors: {[key: string]: string} = {};
    
    // These would be fields from the vehicle details step
    const vehicleMakeError = validateRequired(formData.insuranceInfo?.vehicleMake || '', 'Vehicle make');
    if (vehicleMakeError) errors['insuranceInfo.vehicleMake'] = vehicleMakeError;
    
    const vehicleModelError = validateRequired(formData.insuranceInfo?.vehicleModel || '', 'Vehicle model');
    if (vehicleModelError) errors['insuranceInfo.vehicleModel'] = vehicleModelError;
    
    const vehicleYearError = validateRequired(formData.insuranceInfo?.vehicleYear || '', 'Vehicle year');
    if (vehicleYearError) errors['insuranceInfo.vehicleYear'] = vehicleYearError;
    
    // Vehicle value moved to Vehicle Details; no longer validate here

    // Validate driver same as insured is answered
    if (formData.insuranceInfo?.driverSameAsInsured === undefined) {
      errors['insuranceInfo.driverSameAsInsured'] = 'Please specify if the driver is the same as the insured';
    }

    // If driver is different, validate all driver fields
    if (formData.insuranceInfo?.driverSameAsInsured === false) {
      const driverFirstNameError = validateRequired(formData.insuranceInfo?.driverFirstName || '', 'Driver first name');
      if (driverFirstNameError) errors['insuranceInfo.driverFirstName'] = driverFirstNameError;

      const driverLastNameError = validateRequired(formData.insuranceInfo?.driverLastName || '', 'Driver last name');
      if (driverLastNameError) errors['insuranceInfo.driverLastName'] = driverLastNameError;

      const driverIdNumberError = validateSAIdNumber(formData.insuranceInfo?.driverIdNumber || '');
      if (driverIdNumberError) errors['insuranceInfo.driverIdNumber'] = driverIdNumberError;

      const driverContactNumberError = validatePhone(formData.insuranceInfo?.driverContactNumber || '');
      if (driverContactNumberError) errors['insuranceInfo.driverContactNumber'] = driverContactNumberError;

      const driverOccupationError = validateRequired(formData.insuranceInfo?.driverOccupation || '', 'Driver occupation');
      if (driverOccupationError) errors['insuranceInfo.driverOccupation'] = driverOccupationError;

      const driverLicenseTypeError = validateRequired(formData.insuranceInfo?.driverLicenseType || '', 'Driver license type');
      if (driverLicenseTypeError) errors['insuranceInfo.driverLicenseType'] = driverLicenseTypeError;

      const driverLicenseIssueDateError = validateRequired(formData.insuranceInfo?.driverLicenseIssueDate || '', 'License issue date');
      if (driverLicenseIssueDateError) errors['insuranceInfo.driverLicenseIssueDate'] = driverLicenseIssueDateError;

      // If international license, country is required
      if (formData.insuranceInfo?.driverLicenseType === 'international') {
        const internationalLicenseCountryError = validateRequired(formData.insuranceInfo?.internationalLicenseCountry || '', 'International license country');
        if (internationalLicenseCountryError) errors['insuranceInfo.internationalLicenseCountry'] = internationalLicenseCountryError;
      }

      const driverClaimsHistoryError = validateRequired(formData.insuranceInfo?.driverClaimsHistory || '', 'Driver claims history');
      if (driverClaimsHistoryError) errors['insuranceInfo.driverClaimsHistory'] = driverClaimsHistoryError;

      // If more than two claims, number of claims is required
      if (formData.insuranceInfo?.driverClaimsHistory === 'more-than-two') {
        if (!formData.insuranceInfo?.driverNumberOfClaims || parseInt(formData.insuranceInfo.driverNumberOfClaims) < 3) {
          errors['insuranceInfo.driverNumberOfClaims'] = 'Please enter the number of claims (minimum 3)';
        }
      }

      const driverRelationshipError = validateRequired(formData.insuranceInfo?.driverRelationship || '', 'Driver relationship');
      if (driverRelationshipError) errors['insuranceInfo.driverRelationship'] = driverRelationshipError;

      // If relationship is "other", specification is required
      if (formData.insuranceInfo?.driverRelationship === 'other') {
        const driverRelationshipOtherError = validateRequired(formData.insuranceInfo?.driverRelationshipOther || '', 'Relationship specification');
        if (driverRelationshipOtherError) errors['insuranceInfo.driverRelationshipOther'] = driverRelationshipOtherError;
      }

      const driverMaritalStatusError = validateRequired(formData.insuranceInfo?.driverMaritalStatus || '', 'Driver marital status');
      if (driverMaritalStatusError) errors['insuranceInfo.driverMaritalStatus'] = driverMaritalStatusError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Generic insurance specific validation
  const validateInsuranceSpecific = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!['auto'].includes(insuranceType)) {
      // For non-auto insurance, validate generic fields
      const coverageAmountError = validateRequired(formData.insuranceInfo?.coverageAmount || '', 'Coverage amount');
      if (coverageAmountError) errors['insuranceInfo.coverageAmount'] = coverageAmountError;
      
      const currentInsuranceError = validateRequired(formData.insuranceInfo?.currentInsurance || '', 'Current insurance status');
      if (currentInsuranceError) errors['insuranceInfo.currentInsurance'] = currentInsuranceError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Property details validation (for buildings/contents/commercial property insurance)
  const validatePropertyDetails = (): boolean => {
    if (!['buildings-insurance', 'household-contents', 'commercial-property'].includes(insuranceType)) return true;
    
    const errors: {[key: string]: string} = {};
    
    // Check if property address same as residential is selected
    if (formData.insuranceInfo?.propertySameAsResidential === undefined || formData.insuranceInfo?.propertySameAsResidential === null) {
      errors['insuranceInfo.propertySameAsResidential'] = 'Please indicate if property address is same as residential address';
    }
    
    // Physical address validation (only if property address is different from residential)
    if (formData.insuranceInfo?.propertySameAsResidential === false) {
      const propertyStreetNumberError = validateRequired(formData.insuranceInfo?.propertyStreetNumber || '', 'Street number');
      if (propertyStreetNumberError) errors['insuranceInfo.propertyStreetNumber'] = propertyStreetNumberError;
      
      const propertyStreetNameError = validateRequired(formData.insuranceInfo?.propertyStreetName || '', 'Street name');
      if (propertyStreetNameError) errors['insuranceInfo.propertyStreetName'] = propertyStreetNameError;
      
      const propertySuburbError = validateRequired(formData.insuranceInfo?.propertySuburb || '', 'Suburb/Village');
      if (propertySuburbError) errors['insuranceInfo.propertySuburb'] = propertySuburbError;
      
      const propertyCityError = validateRequired(formData.insuranceInfo?.propertyCity || '', 'City');
      if (propertyCityError) errors['insuranceInfo.propertyCity'] = propertyCityError;
      
      const propertyPostalCodeError = validateRequired(formData.insuranceInfo?.propertyPostalCode || '', 'Postal code');
      if (propertyPostalCodeError) errors['insuranceInfo.propertyPostalCode'] = propertyPostalCodeError;
      
      const propertyProvinceError = validateRequired(formData.insuranceInfo?.propertyProvince || '', 'Province');
      if (propertyProvinceError) errors['insuranceInfo.propertyProvince'] = propertyProvinceError;
    }
    
    // Property type and value
    const propertyTypeError = validateRequired(formData.insuranceInfo?.propertyType || '', 'Building type');
    if (propertyTypeError) errors['insuranceInfo.propertyType'] = propertyTypeError;
    
    // If "other" building type, require description
    if (formData.insuranceInfo?.propertyType === 'other') {
      const propertyTypeOtherError = validateRequired(formData.insuranceInfo?.propertyTypeOther || '', 'Building type description');
      if (propertyTypeOtherError) errors['insuranceInfo.propertyTypeOther'] = propertyTypeOtherError;
    }
    
    const propertyValueError = validateRequired(formData.insuranceInfo?.propertyValue || '', 'Property value');
    if (propertyValueError) errors['insuranceInfo.propertyValue'] = propertyValueError;
    
    // Building construction details
    const wallMaterialError = validateRequired(formData.insuranceInfo?.wallMaterial || '', 'Wall construction material');
    if (wallMaterialError) errors['insuranceInfo.wallMaterial'] = wallMaterialError;
    
    // If "other" wall material, require specification
    if (formData.insuranceInfo?.wallMaterial === 'other') {
      const wallMaterialOtherError = validateRequired(formData.insuranceInfo?.wallMaterialOther || '', 'Wall material specification');
      if (wallMaterialOtherError) errors['insuranceInfo.wallMaterialOther'] = wallMaterialOtherError;
    }
    
    const roofMaterialError = validateRequired(formData.insuranceInfo?.roofMaterial || '', 'Roof material');
    if (roofMaterialError) errors['insuranceInfo.roofMaterial'] = roofMaterialError;
    
    // If "other" roof material, require specification
    if (formData.insuranceInfo?.roofMaterial === 'other') {
      const roofMaterialOtherError = validateRequired(formData.insuranceInfo?.roofMaterialOther || '', 'Roof material specification');
      if (roofMaterialOtherError) errors['insuranceInfo.roofMaterialOther'] = roofMaterialOtherError;
    }
    
    const yearBuiltError = validateRequired(formData.insuranceInfo?.yearBuilt || '', 'Year built');
    if (yearBuiltError) errors['insuranceInfo.yearBuilt'] = yearBuiltError;
    
    const numberOfStoreysError = validateRequired(formData.insuranceInfo?.numberOfStoreys || '', 'Number of storeys');
    if (numberOfStoreysError) errors['insuranceInfo.numberOfStoreys'] = numberOfStoreysError;
    
    // If "5+" storeys, require exact number
    if (formData.insuranceInfo?.numberOfStoreys === '5+') {
      const numberOfStoreysExactError = validateRequired(formData.insuranceInfo?.numberOfStoreysExact || '', 'Exact number of storeys');
      if (numberOfStoreysExactError) errors['insuranceInfo.numberOfStoreysExact'] = numberOfStoreysExactError;
    }
    
    const floorAreaError = validateRequired(formData.insuranceInfo?.floorArea || '', 'Floor area');
    if (floorAreaError) errors['insuranceInfo.floorArea'] = floorAreaError;
    
    // Building use
    const buildingUseError = validateRequired(formData.insuranceInfo?.buildingUse || '', 'Building use');
    if (buildingUseError) errors['insuranceInfo.buildingUse'] = buildingUseError;
    
    // If commercial or mixed use, business type is required
    if (formData.insuranceInfo?.buildingUse === 'commercial' || formData.insuranceInfo?.buildingUse === 'mixed') {
      const businessTypeError = validateRequired(formData.insuranceInfo?.businessType || '', 'Type of business');
      if (businessTypeError) errors['insuranceInfo.businessType'] = businessTypeError;
    }
    
    // Building condition
    const buildingConditionError = validateRequired(formData.insuranceInfo?.buildingCondition || '', 'Building condition');
    if (buildingConditionError) errors['insuranceInfo.buildingCondition'] = buildingConditionError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Business details validation (for business insurance types)
  const validateBusinessDetails = (): boolean => {
    if (!['public-liability', 'small-business', 'commercial-property'].includes(insuranceType)) return true;
    
    const errors: {[key: string]: string} = {};
    
    const businessNameError = validateRequired(formData.insuranceInfo?.businessName || '', 'Business name');
    if (businessNameError) errors.businessName = businessNameError;
    
    const businessTypeError = validateRequired(formData.insuranceInfo?.businessType || '', 'Business type');
    if (businessTypeError) errors.businessType = businessTypeError;
    
    const industrySectorError = validateRequired(formData.insuranceInfo?.industrySector || '', 'Industry sector');
    if (industrySectorError) errors.industrySector = industrySectorError;
    
    const employeeCountError = validateRequired(formData.insuranceInfo?.employeeCount || '', 'Number of employees');
    if (employeeCountError) errors.employeeCount = employeeCountError;
    
    const annualTurnoverError = validateRequired(formData.insuranceInfo?.annualTurnover || '', 'Annual turnover');
    if (annualTurnoverError) errors.annualTurnover = annualTurnoverError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Property usage validation (for commercial property insurance)
  const validatePropertyUsage = (): boolean => {
    if (insuranceType !== 'commercial-property') return true;
    
    const errors: {[key: string]: string} = {};
    
    const primaryBusinessActivityError = validateRequired(formData.insuranceInfo?.primaryBusinessActivity || '', 'Primary business activity');
    if (primaryBusinessActivityError) errors.primaryBusinessActivity = primaryBusinessActivityError;
    
    // Validate other business activity if "other" is selected
    if (formData.insuranceInfo?.primaryBusinessActivity === 'other') {
      const otherBusinessActivityError = validateRequired(formData.insuranceInfo?.otherBusinessActivity || '', 'Business activity description');
      if (otherBusinessActivityError) errors.otherBusinessActivity = otherBusinessActivityError;
    }
    
    const propertyOccupancyError = validateRequired(formData.insuranceInfo?.propertyOccupancy || '', 'Property occupancy');
    if (propertyOccupancyError) errors.propertyOccupancy = propertyOccupancyError;
    
    const operatingHoursError = validateRequired(formData.insuranceInfo?.operatingHours || '', 'Operating hours');
    if (operatingHoursError) errors.operatingHours = operatingHoursError;
    
    const floorAreaError = validateRequired(formData.insuranceInfo?.floorArea || '', 'Floor area');
    if (floorAreaError) errors.floorArea = floorAreaError;
    
    const staffCountError = validateRequired(formData.insuranceInfo?.staffCount || '', 'Staff count');
    if (staffCountError) errors.staffCount = staffCountError;
    
    const securityMeasuresError = validateRequired(
      (formData.insuranceInfo?.securityMeasures || []).length > 0 ? 'selected' : '', 
      'Security measures'
    );
    if (securityMeasuresError) errors.securityMeasures = 'Please select at least one security measure';
    
    // Validate special risks description if special risks are indicated
    if (formData.insuranceInfo?.hasSpecialRisks === 'yes') {
      const specialRisksDescriptionError = validateRequired(formData.insuranceInfo?.specialRisksDescription || '', 'Special risks description');
      if (specialRisksDescriptionError) errors.specialRisksDescription = specialRisksDescriptionError;
    }
    
    // Validate property claims details if claims are indicated
    if (formData.insuranceInfo?.hasPropertyClaims === 'yes') {
      const propertyClaimsDetailsError = validateRequired(formData.insuranceInfo?.propertyClaimsDetails || '', 'Property claims details');
      if (propertyClaimsDetailsError) errors.propertyClaimsDetails = propertyClaimsDetailsError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Business assets validation (for small business insurance)
  const validateBusinessAssets = (): boolean => {
    if (insuranceType !== 'small-business') return true;
    
    const errors: {[key: string]: string} = {};
    
    const buildingValueError = validateRequired(formData.insuranceInfo?.buildingValue || '', 'Building value');
    if (buildingValueError) errors.buildingValue = buildingValueError;
    
    const officeEquipmentValueError = validateRequired(formData.insuranceInfo?.officeEquipmentValue || '', 'Office equipment value');
    if (officeEquipmentValueError) errors.officeEquipmentValue = officeEquipmentValueError;
    
    const stockValueError = validateRequired(formData.insuranceInfo?.stockValue || '', 'Stock/inventory value');
    if (stockValueError) errors.stockValue = stockValueError;
    
    // Validate business interruption details if business interruption is required
    if (formData.insuranceInfo?.requiresBusinessInterruption === 'yes') {
      const monthlyTurnoverError = validateRequired(formData.insuranceInfo?.monthlyTurnover || '', 'Monthly turnover');
      if (monthlyTurnoverError) errors.monthlyTurnover = monthlyTurnoverError;
      
      const interruptionPeriodError = validateRequired(formData.insuranceInfo?.interruptionPeriod || '', 'Coverage period');
      if (interruptionPeriodError) errors.interruptionPeriod = interruptionPeriodError;
    }
    
    // Validate high value items details if high value items are indicated
    if (formData.insuranceInfo?.hasHighValueItems === 'yes') {
      const highValueItemsDetailsError = validateRequired(formData.insuranceInfo?.highValueItemsDetails || '', 'High-value items details');
      if (highValueItemsDetailsError) errors.highValueItemsDetails = highValueItemsDetailsError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Fleet details validation (for transport insurance)
  const validateFleetDetails = (): boolean => {
    if (insuranceType !== 'transport-insurance') return true;
    
    const errors: {[key: string]: string} = {};
    
    const totalVehiclesError = validateRequired(formData.insuranceInfo?.totalVehicles || '', 'Total number of vehicles');
    if (totalVehiclesError) errors.totalVehicles = totalVehiclesError;
    
    const fleetOwnershipError = validateRequired(formData.insuranceInfo?.fleetOwnership || '', 'Fleet ownership status');
    if (fleetOwnershipError) errors.fleetOwnership = fleetOwnershipError;
    
    const vehicleTypesError = validateRequired(
      (formData.insuranceInfo?.vehicleTypes || []).length > 0 ? 'selected' : '', 
      'Vehicle types'
    );
    if (vehicleTypesError) errors.vehicleTypes = 'Please select at least one vehicle type';
    
    const totalFleetValueError = validateRequired(formData.insuranceInfo?.totalFleetValue || '', 'Total fleet value');
    if (totalFleetValueError) errors.totalFleetValue = totalFleetValueError;
    
    const totalDriversError = validateRequired(formData.insuranceInfo?.totalDrivers || '', 'Total number of drivers');
    if (totalDriversError) errors.totalDrivers = totalDriversError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Transport operations validation (for transport insurance)
  const validateTransportOperations = (): boolean => {
    if (insuranceType !== 'transport-insurance') return true;
    
    const errors: {[key: string]: string} = {};
    
    const operationTypesError = validateRequired(
      (formData.insuranceInfo?.operationTypes || []).length > 0 ? 'selected' : '', 
      'Operation types'
    );
    if (operationTypesError) errors.operationTypes = 'Please select at least one operation type';
    
    const operatingAreaError = validateRequired(formData.insuranceInfo?.operatingArea || '', 'Primary operating area');
    if (operatingAreaError) errors.operatingArea = operatingAreaError;
    
    const dailyOperatingHoursError = validateRequired(formData.insuranceInfo?.dailyOperatingHours || '', 'Daily operating hours');
    if (dailyOperatingHoursError) errors.dailyOperatingHours = dailyOperatingHoursError;
    
    const weeklyOperatingDaysError = validateRequired(formData.insuranceInfo?.weeklyOperatingDays || '', 'Weekly operating days');
    if (weeklyOperatingDaysError) errors.weeklyOperatingDays = weeklyOperatingDaysError;
    
    const maxLoadValueError = validateRequired(formData.insuranceInfo?.maxLoadValue || '', 'Maximum load value');
    if (maxLoadValueError) errors.maxLoadValue = maxLoadValueError;
    
    const yearsInBusinessError = validateRequired(formData.insuranceInfo?.yearsInBusiness || '', 'Years in business');
    if (yearsInBusinessError) errors.yearsInBusiness = yearsInBusinessError;
    
    // Validate high risk routes details if high risk routes are indicated
    if (formData.insuranceInfo?.hasHighRiskRoutes === 'yes') {
      const highRiskRoutesDetailsError = validateRequired(formData.insuranceInfo?.highRiskRoutesDetails || '', 'High-risk routes details');
      if (highRiskRoutesDetailsError) errors.highRiskRoutesDetails = highRiskRoutesDetailsError;
    }
    
    // Validate transport claims details if claims are indicated
    if (formData.insuranceInfo?.hasTransportClaims === 'yes') {
      const transportClaimsDetailsError = validateRequired(formData.insuranceInfo?.transportClaimsDetails || '', 'Transport claims details');
      if (transportClaimsDetailsError) errors.transportClaimsDetails = transportClaimsDetailsError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Scheme details validation (for body corporate insurance)
  const validateSchemeDetails = (): boolean => {
    if (insuranceType !== 'body-corporates') return true;
    
    const errors: {[key: string]: string} = {};
    
    const schemeNameError = validateRequired(formData.insuranceInfo?.schemeName || '', 'Scheme name');
    if (schemeNameError) errors.schemeName = schemeNameError;
    
    const yearBuiltError = validateRequired(formData.insuranceInfo?.yearBuilt || '', 'Year built/established');
    if (yearBuiltError) errors.yearBuilt = yearBuiltError;
    
    const schemeStatusError = validateRequired(formData.insuranceInfo?.schemeStatus || '', 'Scheme status');
    if (schemeStatusError) errors.schemeStatus = schemeStatusError;
    
    const totalUnitsError = validateRequired(formData.insuranceInfo?.totalUnits || '', 'Total number of units');
    if (totalUnitsError) errors.totalUnits = totalUnitsError;
    
    const numberOfBuildingsError = validateRequired(formData.insuranceInfo?.numberOfBuildings || '', 'Number of buildings');
    if (numberOfBuildingsError) errors.numberOfBuildings = numberOfBuildingsError;
    
    const numberOfStoreysError = validateRequired(formData.insuranceInfo?.numberOfStoreys || '', 'Number of storeys');
    if (numberOfStoreysError) errors.numberOfStoreys = numberOfStoreysError;
    
    const constructionTypeError = validateRequired(formData.insuranceInfo?.constructionType || '', 'Construction type');
    if (constructionTypeError) errors.constructionType = constructionTypeError;
    
    // Validate other construction type if "other" is selected
    if (formData.insuranceInfo?.constructionType === 'other') {
      const otherConstructionTypeError = validateRequired(formData.insuranceInfo?.otherConstructionType || '', 'Construction type description');
      if (otherConstructionTypeError) errors.otherConstructionType = otherConstructionTypeError;
    }
    
    const unitTypesError = validateRequired(
      (formData.insuranceInfo?.unitTypes || []).length > 0 ? 'selected' : '', 
      'Unit types'
    );
    if (unitTypesError) errors.unitTypes = 'Please select at least one unit type';
    
    const managementTypeError = validateRequired(formData.insuranceInfo?.managementType || '', 'Management type');
    if (managementTypeError) errors.managementType = managementTypeError;
    
    const reserveFundStatusError = validateRequired(formData.insuranceInfo?.reserveFundStatus || '', 'Reserve fund status');
    if (reserveFundStatusError) errors.reserveFundStatus = reserveFundStatusError;
    
    const locationTypeError = validateRequired(formData.insuranceInfo?.locationType || '', 'Location type');
    if (locationTypeError) errors.locationType = locationTypeError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Common areas validation (for body corporate insurance)
  const validateCommonAreas = (): boolean => {
    if (insuranceType !== 'body-corporates') return true;
    
    const errors: {[key: string]: string} = {};
    
    const commonAreaStructuresError = validateRequired(
      (formData.insuranceInfo?.commonAreaStructures || []).length > 0 ? 'selected' : '', 
      'Common area structures'
    );
    if (commonAreaStructuresError) errors.commonAreaStructures = 'Please select at least one common area structure';
    
    const infrastructureSystemsError = validateRequired(
      (formData.insuranceInfo?.infrastructureSystems || []).length > 0 ? 'selected' : '', 
      'Infrastructure systems'
    );
    if (infrastructureSystemsError) errors.infrastructureSystems = 'Please select at least one infrastructure system';
    
    const landscapingExtentError = validateRequired(formData.insuranceInfo?.landscapingExtent || '', 'Landscaping extent');
    if (landscapingExtentError) errors.landscapingExtent = landscapingExtentError;
    
    const securityLevelError = validateRequired(formData.insuranceInfo?.securityLevel || '', 'Security level');
    if (securityLevelError) errors.securityLevel = securityLevelError;
    
    const maintenanceStandardError = validateRequired(formData.insuranceInfo?.maintenanceStandard || '', 'Maintenance standard');
    if (maintenanceStandardError) errors.maintenanceStandard = maintenanceStandardError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Asset details validation (for aviation & marine insurance)
  const validateAssetDetails = (): boolean => {
    if (insuranceType !== 'aviation-marine') return true;
    
    const errors: {[key: string]: string} = {};
    
    const primaryAssetTypeError = validateRequired(formData.insuranceInfo?.primaryAssetType || '', 'Primary asset type');
    if (primaryAssetTypeError) errors.primaryAssetType = primaryAssetTypeError;
    
    const assetManufacturerError = validateRequired(formData.insuranceInfo?.assetManufacturer || '', 'Asset manufacturer');
    if (assetManufacturerError) errors.assetManufacturer = assetManufacturerError;
    
    const assetModelError = validateRequired(formData.insuranceInfo?.assetModel || '', 'Asset model');
    if (assetModelError) errors.assetModel = assetModelError;
    
    const assetYearError = validateRequired(formData.insuranceInfo?.assetYear || '', 'Asset year');
    if (assetYearError) errors.assetYear = assetYearError;
    
    const assetRegistrationError = validateRequired(formData.insuranceInfo?.assetRegistration || '', 'Registration/serial number');
    if (assetRegistrationError) errors.assetRegistration = assetRegistrationError;
    
    const assetValueError = validateRequired(formData.insuranceInfo?.assetValue || '', 'Asset value');
    if (assetValueError) errors.assetValue = assetValueError;
    
    const assetConditionError = validateRequired(formData.insuranceInfo?.assetCondition || '', 'Asset condition');
    if (assetConditionError) errors.assetCondition = assetConditionError;
    
    const storageLocationError = validateRequired(formData.insuranceInfo?.storageLocation || '', 'Storage location');
    if (storageLocationError) errors.storageLocation = storageLocationError;
    
    const storageAddressError = validateRequired(formData.insuranceInfo?.storageAddress || '', 'Storage address');
    if (storageAddressError) errors.storageAddress = storageAddressError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Operations details validation (for aviation & marine insurance)
  const validateOperationsDetails = (): boolean => {
    if (insuranceType !== 'aviation-marine') return true;
    
    const errors: {[key: string]: string} = {};
    
    const primaryUseError = validateRequired(formData.insuranceInfo?.primaryUse || '', 'Primary use of asset');
    if (primaryUseError) errors.primaryUse = primaryUseError;
    
    const annualOperatingHoursError = validateRequired(formData.insuranceInfo?.annualOperatingHours || '', 'Annual operating hours/days');
    if (annualOperatingHoursError) errors.annualOperatingHours = annualOperatingHoursError;
    
    const operatingSeasonError = validateRequired(formData.insuranceInfo?.operatingSeason || '', 'Operating season');
    if (operatingSeasonError) errors.operatingSeason = operatingSeasonError;
    
    const operatingRangeError = validateRequired(formData.insuranceInfo?.operatingRange || '', 'Operating range/area');
    if (operatingRangeError) errors.operatingRange = operatingRangeError;
    
    const operatorExperienceError = validateRequired(formData.insuranceInfo?.operatorExperience || '', 'Operator experience');
    if (operatorExperienceError) errors.operatorExperience = operatorExperienceError;
    
    const validLicensesError = validateRequired(
      (formData.insuranceInfo?.validLicenses || []).length > 0 ? 'selected' : '', 
      'Valid licenses/certifications'
    );
    if (validLicensesError) errors.validLicenses = 'Please select at least one valid license or certification';
    
    const claimsHistoryError = validateRequired(formData.insuranceInfo?.claimsHistory || '', 'Claims history');
    if (claimsHistoryError) errors.claimsHistory = claimsHistoryError;
    
    // Validate claims details if claims exist
    if (formData.insuranceInfo?.claimsHistory && !formData.insuranceInfo.claimsHistory.includes('no-claims')) {
      const claimsDetailsError = validateRequired(formData.insuranceInfo?.claimsDetails || '', 'Claims details');
      if (claimsDetailsError) errors.claimsDetails = claimsDetailsError;
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  const validateDriverDetails = (): boolean => {
    if (insuranceType !== 'auto') return true;
    
    const errors: {[key: string]: string} = {};
    
    if (!formData.needsAnalysis.driverDetails?.licenceType) {
      errors['needsAnalysis.driverDetails.licenceType'] = 'Licence type is required';
    }
    
    if (!formData.needsAnalysis.driverDetails?.licenceFirstIssued) {
      errors['needsAnalysis.driverDetails.licenceFirstIssued'] = 'When licence was first issued is required';
    }
    
    if (!formData.needsAnalysis.driverDetails?.yearsSinceLastClaim) {
      errors['needsAnalysis.driverDetails.yearsSinceLastClaim'] = 'Years since last claim is required';
    }
    
    if (formData.needsAnalysis.driverDetails?.driversUnder25 === undefined) {
      errors['needsAnalysis.driverDetails.driversUnder25'] = 'Please specify if there are drivers under 25';
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Risk factors validation
  const validateRiskFactors = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Buildings/Contents insurance security system validation
    if (['buildings-insurance', 'household-contents'].includes(insuranceType)) {
      // If alarm system is selected, validate required security system fields
      if (formData.needsAnalysis.riskFactors?.securityFeatures?.includes('Alarm system')) {
        const alarmSystemType = formData.needsAnalysis.riskFactors?.alarmSystemType;
        if (!alarmSystemType) {
          errors['alarmSystemType'] = 'Alarm system type is required when alarm system is selected';
        }

        const securityCompany = formData.needsAnalysis.riskFactors?.securityCompany;
        if (!securityCompany) {
          errors['securityCompany'] = 'Security company/provider is required when alarm system is selected';
        }

        const monitoringType = formData.needsAnalysis.riskFactors?.monitoringType;
        if (!monitoringType) {
          errors['monitoringType'] = 'Monitoring type is required when alarm system is selected';
        }

        const responseTime = formData.needsAnalysis.riskFactors?.responseTime;
        if (!responseTime) {
          errors['responseTime'] = 'Response time is required when alarm system is selected';
        }
      }
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Consent step validation
  const validateConsent = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.consentGiven) {
      errors['consentGiven'] = 'You must provide consent to proceed';
    }
    
    if (!formData.digitalSignature) {
      errors['digitalSignature'] = 'Digital signature is required';
    }
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // E-Hailing details validation
  const validateEHailingDetails = (): boolean => {
    if (insuranceType !== 'e-hailing') return true;
    
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    const primaryPlatformError = validateRequired(formData.insuranceInfo?.primaryPlatform || '', 'Primary e-hailing platform');
    if (primaryPlatformError) errors.primaryPlatform = primaryPlatformError;
    
    const weeklyHoursError = validateRequired(formData.insuranceInfo?.weeklyHours || '', 'Average weekly hours');
    if (weeklyHoursError) errors.weeklyHours = weeklyHoursError;
    
    const operatingAreasError = validateRequired(
      (formData.insuranceInfo?.operatingAreas || []).length > 0 ? 'valid' : '', 
      'Operating areas (at least one required)'
    );
    if (operatingAreasError) errors.operatingAreas = 'Please select at least one operating area';
    
    const monthlyIncomeError = validateRequired(formData.insuranceInfo?.monthlyIncome || '', 'Monthly income range');
    if (monthlyIncomeError) errors.monthlyIncome = monthlyIncomeError;
    
    const vehicleOwnershipError = validateRequired(formData.insuranceInfo?.vehicleOwnership || '', 'Vehicle ownership status');
    if (vehicleOwnershipError) errors.vehicleOwnership = vehicleOwnershipError;
    
    setValidationErrors(prev => ({...prev, ...errors}));
    return Object.keys(errors).length === 0;
  };

  // Main validation function for current step
  const validateCurrentStep = (): boolean => {
    const stepId = steps[currentStep]?.id;
    let isValid = true;
    
    switch (stepId) {
      case 'personal':
        isValid = validatePersonalInfo();
        break;
      case 'company':
        isValid = validateCompanyInfo();
        break;
      case 'current-situation':
        isValid = validateCurrentSituation();
        break;
      case 'coverage-needs':
        isValid = validateCoverageNeeds();
        break;
      case 'insurance-specific':
        // Use appropriate validation based on insurance type
        if (insuranceType === 'auto') {
          isValid = validateVehicleDetails();
        } else {
          isValid = validateInsuranceSpecific();
        }
        break;
      case 'vehicle-details':
        isValid = validateVehicleDetails();
        break;
      case 'driver-details':
        isValid = validateDriverDetails();
        break;
      case 'property-details':
        isValid = validatePropertyDetails();
        break;
      case 'business-details':
        isValid = validateBusinessDetails();
        break;
      case 'property-usage':
        isValid = validatePropertyUsage();
        break;
      case 'business-assets':
        isValid = validateBusinessAssets();
        break;
      case 'fleet-details':
        isValid = validateFleetDetails();
        break;
      case 'transport-operations':
        isValid = validateTransportOperations();
        break;
      case 'scheme-details':
        isValid = validateSchemeDetails();
        break;
      case 'common-areas':
        isValid = validateCommonAreas();
        break;
      case 'asset-details':
        isValid = validateAssetDetails();
        break;
      case 'operations':
        isValid = validateOperationsDetails();
        break;
      case 'risk-factors':
        isValid = validateRiskFactors();
        break;
      case 'preferences':
        isValid = validatePreferences();
        break;
      case 'project-details':
      case 'construction-type':
        isValid = validateEngineeringConstruction();
        break;
      case 'consent':
        isValid = validateConsent();
        break;
      case 'e-hailing-details':
        isValid = validateEHailingDetails();
        break;
      default:
        // For steps without specific validation, assume valid
        isValid = true;
    }
    
    // If validation passed, clear any lingering errors from previous attempts on this step
    if (isValid) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        // Clear errors related to the current step
        Object.keys(newErrors).forEach(key => {
          // Check if the error belongs to the current step's section
          const section = key.split('.')[0];
          const stepSections = {
            'personal': ['personalInfo'],
            'current-situation': ['currentSituation'],
            'coverage-needs': ['coverageNeeds'],
            'insurance-specific': ['insuranceInfo'],
            'vehicle-details': ['insuranceInfo'],
            'driver-details': ['insuranceInfo'],
            'property-details': ['insuranceInfo'],
            'business-details': ['insuranceInfo'],
            'property-usage': ['insuranceInfo'],
            'business-assets': ['insuranceInfo'],
            'fleet-details': ['insuranceInfo'],
            'transport-operations': ['insuranceInfo'],
            'scheme-details': ['insuranceInfo'],
            'common-areas': ['insuranceInfo'],
            'asset-details': ['insuranceInfo'],
            'operations': ['insuranceInfo'],
            'risk-factors': ['insuranceInfo'],
            'preferences': ['insuranceInfo'],
            'project-details': ['insuranceInfo'],
            'construction-type': ['insuranceInfo'],
            'consent': ['consent'],
            'e-hailing-details': ['insuranceInfo']
          } as Record<string, string[]>;
          
          const currentStepSections = stepSections[stepId] || [];
          if (currentStepSections.includes(section)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
    
    return isValid;
  };

  // Helper function to get validation error for a field
  const getFieldError = (fieldPath: string): string | undefined => {
    return validationErrors[fieldPath];
  };

  // Helper function to check if a field has an error
  const hasFieldError = (fieldPath: string): boolean => {
    return !!validationErrors[fieldPath];
  };

  // Function to handle moving to the next step or submitting the form
  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Only submit if consent is given and all validations pass
      if (formData.consentGiven) {
        onSubmit(formData);
      }
    }
  };

  // Function to handle going back to previous step or main page
  const handleBack = () => {
    if (currentStep > 0) {
      // Go to previous step if not on first step
      setCurrentStep(currentStep - 1);
    } else {
      // Go back to main page if on first step
      onBack();
    }
  };

  // Function to get display title for insurance type
  const getInsuranceTitle = (type: InsuranceType) => {
    const titles = {
      auto: 'Car Insurance',
      'buildings-insurance': 'Buildings Insurance',
      'household-contents': 'Household Contents',
      life: 'Commercial Property',
      health: 'Medical Aid',
      'public-liability': 'Public Liability',
      'small-business': 'Small Business Insurance',
      'commercial-property': 'Commercial Property',
      'transport-insurance': 'Transport Insurance',
      'body-corporates': 'Body Corporates',
      'engineering-construction': 'Engineering & Construction',
      'aviation-marine': 'Aviation & Marine',
      'mining-rehabilitation': 'Mining Rehabilitation Guarantees',
      'e-hailing': 'E-Hailing Insurance',
    };
    return titles[type] || 'Insurance';
  };

  // Function to render the personal information step (Step 1)
  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      {/* First and Last Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            First Name *
          </label>
          {/* Input field with icon for first name */}
          <div className="relative">
            <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.personalInfo.firstName}
              onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.firstName') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter your first name"
            />
          </div>
          {hasFieldError('personalInfo.firstName') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.firstName')}
            </p>
          )}
        </div>
        {/* Similar structure for last name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.personalInfo.lastName}
              onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.lastName') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter your last name"
            />
          </div>
          {hasFieldError('personalInfo.lastName') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.lastName')}
            </p>
          )}
        </div>
      </div>

      {/* Email and Phone Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Email Address *
          </label>
          {/* Email input with mail icon */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.personalInfo.email}
              onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.email') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          {hasFieldError('personalInfo.email') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.email')}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Phone Number *
          </label>
          {/* Phone input with phone icon */}
          <div className="relative">
            <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.phone') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="083 123 4567"
            />
          </div>
          {hasFieldError('personalInfo.phone') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.phone')}
            </p>
          )}
        </div>
      </div>

      {/* ID Number Row */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          ID Number *
        </label>
        {/* South African ID number input */}
        <input
          type="text"
          value={formData.personalInfo.idNumber}
          onChange={(e) => updateFormData('personalInfo', 'idNumber', e.target.value)}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
            hasFieldError('personalInfo.idNumber') 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
          placeholder="8001015009087"
          maxLength={13}
        />
        {hasFieldError('personalInfo.idNumber') && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {getFieldError('personalInfo.idNumber')}
          </p>
        )}
      </div>

      {/* Marital Status and Occupation Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Marital Status *
          </label>
          <select
            value={formData.personalInfo.maritalStatus}
            onChange={(e) => updateFormData('personalInfo', 'maritalStatus', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
              hasFieldError('personalInfo.maritalStatus') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
          >
            <option value="">Select marital status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
          {hasFieldError('personalInfo.maritalStatus') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.maritalStatus')}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Occupation *
          </label>
          <select
            value={formData.personalInfo.occupation}
            onChange={(e) => updateFormData('personalInfo', 'occupation', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
              hasFieldError('personalInfo.occupation') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
          >
            <option value="">Select occupation</option>
            <option value="self-employed">Self-Employed</option>
            <option value="employed">Work for an Employer</option>
            <option value="pensioner">Pensioner</option>
            <option value="unemployed">Unemployed</option>
          </select>
          {hasFieldError('personalInfo.occupation') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('personalInfo.occupation')}
            </p>
          )}
        </div>
      </div>

      {/* Physical Address Section */}
      <div className="bg-blue-50 p-6 rounded-xl space-y-4 border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Physical Address</h4>
        
        {/* Street Number and Street Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Number *
            </label>
            <input
              type="text"
              value={formData.personalInfo.streetNumber}
              onChange={(e) => updateFormData('personalInfo', 'streetNumber', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.streetNumber') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., 123"
            />
            {hasFieldError('personalInfo.streetNumber') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.streetNumber')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Name *
            </label>
            <input
              type="text"
              value={formData.personalInfo.streetName}
              onChange={(e) => updateFormData('personalInfo', 'streetName', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.streetName') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Main Street"
            />
            {hasFieldError('personalInfo.streetName') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.streetName')}
              </p>
            )}
          </div>
        </div>

        {/* Village/City and Area Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Village / City *
            </label>
            <input
              type="text"
              value={formData.personalInfo.village}
              onChange={(e) => updateFormData('personalInfo', 'village', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.village') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Sandton"
            />
            {hasFieldError('personalInfo.village') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.village')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Area Code *
            </label>
            <input
              type="text"
              value={formData.personalInfo.areaCode}
              onChange={(e) => updateFormData('personalInfo', 'areaCode', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.areaCode') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., 2196"
              maxLength={4}
            />
            {hasFieldError('personalInfo.areaCode') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.areaCode')}
              </p>
            )}
          </div>
        </div>

        {/* Province and Country Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Province *
            </label>
            <select
              value={formData.personalInfo.province}
              onChange={(e) => updateFormData('personalInfo', 'province', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.province') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            >
              <option value="">Select province</option>
              <option value="gauteng">Gauteng</option>
              <option value="western-cape">Western Cape</option>
              <option value="eastern-cape">Eastern Cape</option>
              <option value="kwazulu-natal">KwaZulu-Natal</option>
              <option value="free-state">Free State</option>
              <option value="limpopo">Limpopo</option>
              <option value="mpumalanga">Mpumalanga</option>
              <option value="north-west">North West</option>
              <option value="northern-cape">Northern Cape</option>
            </select>
            {hasFieldError('personalInfo.province') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.province')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Country *
            </label>
            <select
              value={formData.personalInfo.country}
              onChange={(e) => updateFormData('personalInfo', 'country', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.country') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            >
              <option value="">Select country</option>
              <option value="south-africa">South Africa</option>
              <option value="botswana">Botswana</option>
              <option value="lesotho">Lesotho</option>
              <option value="namibia">Namibia</option>
              <option value="eswatini">Eswatini</option>
              <option value="zimbabwe">Zimbabwe</option>
              <option value="mozambique">Mozambique</option>
              <option value="zambia">Zambia</option>
              <option value="other">Other</option>
            </select>
            {hasFieldError('personalInfo.country') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.country')}
              </p>
            )}
          </div>
        </div>

        {/* Country Other Specification */}
        {formData.personalInfo.country === 'other' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Please Specify Country *
            </label>
            <input
              type="text"
              value={formData.personalInfo.countryOther || ''}
              onChange={(e) => updateFormData('personalInfo', 'countryOther', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('personalInfo.countryOther') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter country name"
            />
            {hasFieldError('personalInfo.countryOther') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('personalInfo.countryOther')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Co-Insured Section */}
      <div className="bg-green-50 p-6 rounded-xl space-y-4 border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Co-Insured Information (Optional)</h4>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.coInsured?.hasCoInsured || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                coInsured: {
                  ...prev.coInsured!,
                  hasCoInsured: e.target.checked
                }
              }))}
              className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Add Co-Insured</span>
          </label>
        </div>

        {formData.coInsured?.hasCoInsured && (
          <div className="space-y-6">
            {/* Co-Insured Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.coInsured?.firstName || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coInsured: {
                        ...prev.coInsured!,
                        firstName: e.target.value
                      }
                    }))}
                    className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                      hasFieldError('coInsured.firstName') 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {hasFieldError('coInsured.firstName') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.firstName')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.coInsured?.lastName || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coInsured: {
                        ...prev.coInsured!,
                        lastName: e.target.value
                      }
                    }))}
                    className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                      hasFieldError('coInsured.lastName') 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
                {hasFieldError('coInsured.lastName') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.lastName')}
                  </p>
                )}
              </div>
            </div>

            {/* Co-Insured ID and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ID Number *
                </label>
                <input
                  type="text"
                  value={formData.coInsured?.idNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coInsured: {
                      ...prev.coInsured!,
                      idNumber: e.target.value
                    }
                  }))}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                    hasFieldError('coInsured.idNumber') 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="8001015009087"
                  maxLength={13}
                />
                {hasFieldError('coInsured.idNumber') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.idNumber')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.coInsured?.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coInsured: {
                        ...prev.coInsured!,
                        phone: e.target.value
                      }
                    }))}
                    className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                      hasFieldError('coInsured.phone') 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="083 123 4567"
                  />
                </div>
                {hasFieldError('coInsured.phone') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.phone')}
                  </p>
                )}
              </div>
            </div>

            {/* Co-Insured Email and Relationship Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.coInsured?.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coInsured: {
                        ...prev.coInsured!,
                        email: e.target.value
                      }
                    }))}
                    className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                      hasFieldError('coInsured.email') 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="email@example.com"
                  />
                </div>
                {hasFieldError('coInsured.email') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.email')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Relationship to Client *
                </label>
                <select
                  value={formData.coInsured?.relationship || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coInsured: {
                      ...prev.coInsured!,
                      relationship: e.target.value
                    }
                  }))}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                    hasFieldError('coInsured.relationship') 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="partner">Partner</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other-family">Other Family Member</option>
                  <option value="business-partner">Business Partner</option>
                  <option value="other">Other</option>
                </select>
                {hasFieldError('coInsured.relationship') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.relationship')}
                  </p>
                )}
              </div>
            </div>

            {/* Relationship Other Specification */}
            {formData.coInsured?.relationship === 'other' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Please Specify Relationship *
                </label>
                <input
                  type="text"
                  value={formData.coInsured?.relationshipOther || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coInsured: {
                      ...prev.coInsured!,
                      relationshipOther: e.target.value
                    }
                  }))}
                  className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                    hasFieldError('coInsured.relationshipOther') 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="e.g., Friend, Colleague"
                />
                {hasFieldError('coInsured.relationshipOther') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {getFieldError('coInsured.relationshipOther')}
                  </p>
                )}
              </div>
            )}

            {/* Same Address Checkbox */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.coInsured?.sameAddress || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coInsured: {
                      ...prev.coInsured!,
                      sameAddress: e.target.checked
                    }
                  }))}
                  className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Co-insured has the same address as client</span>
              </label>
            </div>

            {/* Co-Insured Address (only if different address) */}
            {!formData.coInsured?.sameAddress && (
              <div className="bg-yellow-50 p-4 rounded-lg space-y-4 border-2 border-yellow-200">
                <h5 className="text-md font-semibold text-gray-900">Co-Insured Physical Address</h5>
                
                {/* Street Number and Street Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Street Number *
                    </label>
                    <input
                      type="text"
                      value={formData.coInsured?.streetNumber || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          streetNumber: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.streetNumber') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="e.g., 123"
                    />
                    {hasFieldError('coInsured.streetNumber') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.streetNumber')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Street Name *
                    </label>
                    <input
                      type="text"
                      value={formData.coInsured?.streetName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          streetName: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.streetName') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="e.g., Main Street"
                    />
                    {hasFieldError('coInsured.streetName') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.streetName')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Village/City and Area Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Village / City *
                    </label>
                    <input
                      type="text"
                      value={formData.coInsured?.village || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          village: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.village') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="e.g., Sandton"
                    />
                    {hasFieldError('coInsured.village') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.village')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Area Code *
                    </label>
                    <input
                      type="text"
                      value={formData.coInsured?.areaCode || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          areaCode: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.areaCode') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="e.g., 2196"
                      maxLength={4}
                    />
                    {hasFieldError('coInsured.areaCode') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.areaCode')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Province and Country Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Province *
                    </label>
                    <select
                      value={formData.coInsured?.province || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          province: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.province') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select province</option>
                      <option value="gauteng">Gauteng</option>
                      <option value="western-cape">Western Cape</option>
                      <option value="eastern-cape">Eastern Cape</option>
                      <option value="kwazulu-natal">KwaZulu-Natal</option>
                      <option value="free-state">Free State</option>
                      <option value="limpopo">Limpopo</option>
                      <option value="mpumalanga">Mpumalanga</option>
                      <option value="north-west">North West</option>
                      <option value="northern-cape">Northern Cape</option>
                    </select>
                    {hasFieldError('coInsured.province') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.province')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Country *
                    </label>
                    <select
                      value={formData.coInsured?.country || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          country: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.country') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select country</option>
                      <option value="south-africa">South Africa</option>
                      <option value="botswana">Botswana</option>
                      <option value="lesotho">Lesotho</option>
                      <option value="namibia">Namibia</option>
                      <option value="eswatini">Eswatini</option>
                      <option value="zimbabwe">Zimbabwe</option>
                      <option value="mozambique">Mozambique</option>
                      <option value="zambia">Zambia</option>
                      <option value="other">Other</option>
                    </select>
                    {hasFieldError('coInsured.country') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.country')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Co-Insured Country Other Specification */}
                {formData.coInsured?.country === 'other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Please Specify Country *
                    </label>
                    <input
                      type="text"
                      value={formData.coInsured?.countryOther || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        coInsured: {
                          ...prev.coInsured!,
                          countryOther: e.target.value
                        }
                      }))}
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                        hasFieldError('coInsured.countryOther') 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter country name"
                    />
                    {hasFieldError('coInsured.countryOther') && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {getFieldError('coInsured.countryOther')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Function to render the company information step (for business insurance)
  const renderCompanyInfo = () => (
    <div className="space-y-6">
      {/* Company Name and Registration Number Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Company Name *
          </label>
          <div className="relative">
            <Building className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.companyInfo.companyName}
              onChange={(e) => updateFormData('companyInfo', 'companyName', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.companyName') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter company name"
            />
          </div>
          {hasFieldError('companyInfo.companyName') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.companyName')}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Registration Number *
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.companyInfo.registrationNumber}
              onChange={(e) => updateFormData('companyInfo', 'registrationNumber', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.registrationNumber') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter registration number"
            />
          </div>
          {hasFieldError('companyInfo.registrationNumber') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.registrationNumber')}
            </p>
          )}
        </div>
      </div>

      {/* VAT Number and Year Established Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            VAT Number *
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.companyInfo.vatNumber}
              onChange={(e) => updateFormData('companyInfo', 'vatNumber', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.vatNumber') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter VAT number"
            />
          </div>
          {hasFieldError('companyInfo.vatNumber') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.vatNumber')}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Year Established *
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.companyInfo.yearEstablished}
              onChange={(e) => updateFormData('companyInfo', 'yearEstablished', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.yearEstablished') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., 2015"
              maxLength={4}
            />
          </div>
          {hasFieldError('companyInfo.yearEstablished') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.yearEstablished')}
            </p>
          )}
        </div>
      </div>

      {/* Business Type Row */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Business Type *
        </label>
        <select
          value={formData.companyInfo.businessType}
          onChange={(e) => updateFormData('companyInfo', 'businessType', e.target.value)}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
            hasFieldError('companyInfo.businessType') 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        >
          <option value="">Select business type</option>
          <option value="sole-proprietorship">Sole Proprietorship</option>
          <option value="partnership">Partnership</option>
          <option value="private-company">Private Company (Pty Ltd)</option>
          <option value="public-company">Public Company (Ltd)</option>
          <option value="close-corporation">Close Corporation (CC)</option>
          <option value="trust">Trust</option>
          <option value="ngo">Non-Governmental Organization (NGO)</option>
          <option value="npc">Non-Profit Company (NPC)</option>
          <option value="other">Other</option>
        </select>
        {hasFieldError('companyInfo.businessType') && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {getFieldError('companyInfo.businessType')}
          </p>
        )}
      </div>

      {/* Business Type Other Specification */}
      {formData.companyInfo.businessType === 'other' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please Specify Business Type *
          </label>
          <input
            type="text"
            value={formData.companyInfo.businessTypeOther || ''}
            onChange={(e) => updateFormData('companyInfo', 'businessTypeOther', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
              hasFieldError('companyInfo.businessTypeOther') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Specify business type"
          />
          {hasFieldError('companyInfo.businessTypeOther') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.businessTypeOther')}
            </p>
          )}
        </div>
      )}

      {/* Industry Type Row */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Industry Type *
        </label>
        <select
          value={formData.companyInfo.industryType}
          onChange={(e) => updateFormData('companyInfo', 'industryType', e.target.value)}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
            hasFieldError('companyInfo.industryType') 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        >
          <option value="">Select industry type</option>
          <option value="retail">Retail</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="construction">Construction</option>
          <option value="hospitality">Hospitality</option>
          <option value="healthcare">Healthcare</option>
          <option value="education">Education</option>
          <option value="technology">Technology & IT</option>
          <option value="finance">Finance & Insurance</option>
          <option value="real-estate">Real Estate</option>
          <option value="transport">Transport & Logistics</option>
          <option value="agriculture">Agriculture</option>
          <option value="professional-services">Professional Services</option>
          <option value="other">Other</option>
        </select>
        {hasFieldError('companyInfo.industryType') && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {getFieldError('companyInfo.industryType')}
          </p>
        )}
      </div>

      {/* Industry Type Other Specification */}
      {formData.companyInfo.industryType === 'other' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Please Specify Industry Type *
          </label>
          <input
            type="text"
            value={formData.companyInfo.industryTypeOther || ''}
            onChange={(e) => updateFormData('companyInfo', 'industryTypeOther', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
              hasFieldError('companyInfo.industryTypeOther') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
            placeholder="Specify industry type"
          />
          {hasFieldError('companyInfo.industryTypeOther') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.industryTypeOther')}
            </p>
          )}
        </div>
      )}

      {/* Number of Employees */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Number of Employees *
        </label>
        <select
          value={formData.companyInfo.numberOfEmployees}
          onChange={(e) => updateFormData('companyInfo', 'numberOfEmployees', e.target.value)}
          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
            hasFieldError('companyInfo.numberOfEmployees') 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        >
          <option value="">Select number of employees</option>
          <option value="1-5">1-5 employees</option>
          <option value="6-10">6-10 employees</option>
          <option value="11-25">11-25 employees</option>
          <option value="26-50">26-50 employees</option>
          <option value="51-100">51-100 employees</option>
          <option value="101-250">101-250 employees</option>
          <option value="251-500">251-500 employees</option>
          <option value="501+">501+ employees</option>
        </select>
        {hasFieldError('companyInfo.numberOfEmployees') && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {getFieldError('companyInfo.numberOfEmployees')}
          </p>
        )}
      </div>

      {/* Company Contact Information Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Company Contact Information</h3>
        
        {/* Email and Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Company Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.companyInfo.email}
                onChange={(e) => updateFormData('companyInfo', 'email', e.target.value)}
                className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                  hasFieldError('companyInfo.email') 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="company@example.com"
              />
            </div>
            {hasFieldError('companyInfo.email') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.email')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Company Phone *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.companyInfo.phone}
                onChange={(e) => updateFormData('companyInfo', 'phone', e.target.value)}
                className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                  hasFieldError('companyInfo.phone') 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="011 123 4567"
              />
            </div>
            {hasFieldError('companyInfo.phone') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.phone')}
              </p>
            )}
          </div>
        </div>

        {/* Alternative Phone */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Alternative Phone (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.companyInfo.alternativePhone || ''}
              onChange={(e) => updateFormData('companyInfo', 'alternativePhone', e.target.value)}
              className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.alternativePhone') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="012 345 6789"
            />
          </div>
          {hasFieldError('companyInfo.alternativePhone') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('companyInfo.alternativePhone')}
            </p>
          )}
        </div>
      </div>

      {/* Company Physical Address Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Company Physical Address</h3>
        
        {/* Street Number and Street Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Number *
            </label>
            <input
              type="text"
              value={formData.companyInfo.streetNumber}
              onChange={(e) => updateFormData('companyInfo', 'streetNumber', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.streetNumber') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., 123"
            />
            {hasFieldError('companyInfo.streetNumber') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.streetNumber')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Street Name *
            </label>
            <input
              type="text"
              value={formData.companyInfo.streetName}
              onChange={(e) => updateFormData('companyInfo', 'streetName', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.streetName') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Main Street"
            />
            {hasFieldError('companyInfo.streetName') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.streetName')}
              </p>
            )}
          </div>
        </div>

        {/* Village/City and Area Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Village/City *
            </label>
            <input
              type="text"
              value={formData.companyInfo.village}
              onChange={(e) => updateFormData('companyInfo', 'village', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.village') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Johannesburg"
            />
            {hasFieldError('companyInfo.village') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.village')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Area Code *
            </label>
            <input
              type="text"
              value={formData.companyInfo.areaCode}
              onChange={(e) => updateFormData('companyInfo', 'areaCode', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.areaCode') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., 2000"
              maxLength={4}
            />
            {hasFieldError('companyInfo.areaCode') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.areaCode')}
              </p>
            )}
          </div>
        </div>

        {/* Province and Country Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Province *
            </label>
            <select
              value={formData.companyInfo.province}
              onChange={(e) => updateFormData('companyInfo', 'province', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.province') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            >
              <option value="">Select province</option>
              <option value="gauteng">Gauteng</option>
              <option value="western-cape">Western Cape</option>
              <option value="eastern-cape">Eastern Cape</option>
              <option value="kwazulu-natal">KwaZulu-Natal</option>
              <option value="limpopo">Limpopo</option>
              <option value="mpumalanga">Mpumalanga</option>
              <option value="northern-cape">Northern Cape</option>
              <option value="north-west">North West</option>
              <option value="free-state">Free State</option>
            </select>
            {hasFieldError('companyInfo.province') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.province')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Country *
            </label>
            <select
              value={formData.companyInfo.country}
              onChange={(e) => updateFormData('companyInfo', 'country', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.country') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            >
              <option value="">Select country</option>
              <option value="south-africa">South Africa</option>
              <option value="other">Other</option>
            </select>
            {hasFieldError('companyInfo.country') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.country')}
              </p>
            )}
          </div>
        </div>

        {/* Country Other Specification */}
        {formData.companyInfo.country === 'other' && (
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Please Specify Country *
            </label>
            <input
              type="text"
              value={formData.companyInfo.countryOther || ''}
              onChange={(e) => updateFormData('companyInfo', 'countryOther', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.countryOther') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Specify country"
            />
            {hasFieldError('companyInfo.countryOther') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.countryOther')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Contact Person Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Person Details</h3>
        
        {/* Contact Person Name and Position Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Contact Person Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.companyInfo.contactPersonName}
                onChange={(e) => updateFormData('companyInfo', 'contactPersonName', e.target.value)}
                className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                  hasFieldError('companyInfo.contactPersonName') 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Full name"
              />
            </div>
            {hasFieldError('companyInfo.contactPersonName') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.contactPersonName')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Position/Title *
            </label>
            <input
              type="text"
              value={formData.companyInfo.contactPersonPosition}
              onChange={(e) => updateFormData('companyInfo', 'contactPersonPosition', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                hasFieldError('companyInfo.contactPersonPosition') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="e.g., Managing Director"
            />
            {hasFieldError('companyInfo.contactPersonPosition') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.contactPersonPosition')}
              </p>
            )}
          </div>
        </div>

        {/* Contact Person Email and Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Contact Person Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.companyInfo.contactPersonEmail}
                onChange={(e) => updateFormData('companyInfo', 'contactPersonEmail', e.target.value)}
                className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                  hasFieldError('companyInfo.contactPersonEmail') 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="person@company.com"
              />
            </div>
            {hasFieldError('companyInfo.contactPersonEmail') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.contactPersonEmail')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Contact Person Phone *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.companyInfo.contactPersonPhone}
                onChange={(e) => updateFormData('companyInfo', 'contactPersonPhone', e.target.value)}
                className={`pl-12 w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-900 ${
                  hasFieldError('companyInfo.contactPersonPhone') 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="083 123 4567"
              />
            </div>
            {hasFieldError('companyInfo.contactPersonPhone') && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {getFieldError('companyInfo.contactPersonPhone')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Current Situation Assessment Step
  const renderCurrentSituationStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Current Insurance Situation</h3>
      
      <div className="space-y-4">
        {/* Existing Insurance Question */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you currently have {getInsuranceTitle(insuranceType).toLowerCase()} insurance?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExistingInsurance"
                value="true"
                checked={formData.needsAnalysis.currentSituation.hasExistingInsurance === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      hasExistingInsurance: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>Yes, I have existing coverage</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExistingInsurance"
                value="false"
                checked={formData.needsAnalysis.currentSituation.hasExistingInsurance === false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      hasExistingInsurance: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>No, I need new coverage</span>
            </label>
          </div>
        </div>

        {/* Conditional fields for existing insurance */}
        {formData.needsAnalysis.currentSituation.hasExistingInsurance && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Insurance Provider
              </label>
              <input
                type="text"
                placeholder="e.g., Old Mutual, Santam, Discovery"
                value={formData.needsAnalysis.currentSituation.currentProvider || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      currentProvider: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {insuranceType === 'auto' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter your current policy number"
                  value={formData.needsAnalysis.currentSituation.policyNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    needsAnalysis: {
                      ...prev.needsAnalysis,
                      currentSituation: {
                        ...prev.needsAnalysis.currentSituation,
                        policyNumber: e.target.value
                      }
                    }
                  }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['needsAnalysis.currentSituation.policyNumber'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['needsAnalysis.currentSituation.policyNumber'] && (
                  <div className="mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {validationErrors['needsAnalysis.currentSituation.policyNumber']}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When did this Policy Start?
              </label>
              <input
                type="date"
                value={formData.needsAnalysis.currentSituation.policyStartDate || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      policyStartDate: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Claims History */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Have you made any claims in the last 3 years? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClaimsLastThreeYears"
                value="true"
                checked={formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      claimsHistory: {
                        ...prev.needsAnalysis.currentSituation.claimsHistory,
                        hasClaimsLastThreeYears: e.target.value === 'true'
                      }
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>Yes, I have made claims</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasClaimsLastThreeYears"
                value="false"
                checked={formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears === false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    currentSituation: {
                      ...prev.needsAnalysis.currentSituation,
                      claimsHistory: {
                        hasClaimsLastThreeYears: e.target.value === 'true',
                        // Clear claim details when user selects "No"
                        numberOfClaims: undefined,
                        totalClaimAmount: undefined,
                        currentInsuranceStatus: undefined
                      }
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>No claims made</span>
            </label>
          </div>
          
          {/* Conditional fields that appear when user selects "Yes" */}
          {formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears && (
            <div className="mt-4 space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Claims Details</h4>
              
              {/* Number of Claims in Last 12 Months */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many claims have you had in the last 12 months? *
                </label>
                <select
                  value={formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    needsAnalysis: {
                      ...prev.needsAnalysis,
                      currentSituation: {
                        ...prev.needsAnalysis.currentSituation,
                        claimsHistory: {
                          ...prev.needsAnalysis.currentSituation.claimsHistory,
                          numberOfClaims: parseInt(e.target.value)
                        }
                      }
                    }
                  }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['needsAnalysis.currentSituation.claimsHistory.numberOfClaims'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select number of claims</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">More than two</option>
                </select>
                {validationErrors['needsAnalysis.currentSituation.claimsHistory.numberOfClaims'] && (
                  <div className="mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {validationErrors['needsAnalysis.currentSituation.claimsHistory.numberOfClaims']}
                    </p>
                  </div>
                )}
              </div>

              {/* Conditional comment field for 2 or more claims */}
              {formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims && 
               formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims >= 2 && (
                <>
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-red-800 mb-1">Important Notice</h5>
                        <p className="text-sm text-red-700">
                          Please note that some insurance companies may refuse to provide a quote due to more than one claim in the last 12 months. 
                          Please provide details to help us find suitable coverage options.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please explain what happened and indicate if a third party was involved *
                    </label>
                    <textarea
                      value={formData.needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          currentSituation: {
                            ...prev.needsAnalysis.currentSituation,
                            claimsHistory: {
                              ...prev.needsAnalysis.currentSituation.claimsHistory,
                              multipleClaimsExplanation: e.target.value
                            }
                          }
                        }
                      }))}
                      rows={4}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors['needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation'] 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Describe the circumstances of the claims and whether third parties were involved..."
                    />
                    {validationErrors['needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation'] && (
                      <div className="mt-2 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">
                          {validationErrors['needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation']}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Total Claim Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total claim amount (approximate) *
                  <span className="text-xs text-gray-500 block mt-1">Enter the total amount in Rands (R)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.needsAnalysis.currentSituation.claimsHistory.totalClaimAmount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        currentSituation: {
                          ...prev.needsAnalysis.currentSituation,
                          claimsHistory: {
                            ...prev.needsAnalysis.currentSituation.claimsHistory,
                            totalClaimAmount: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        }
                      }
                    }))}
                    className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors['needsAnalysis.currentSituation.claimsHistory.totalClaimAmount'] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 15000"
                  />
                </div>
                {validationErrors['needsAnalysis.currentSituation.claimsHistory.totalClaimAmount'] && (
                  <div className="mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {validationErrors['needsAnalysis.currentSituation.claimsHistory.totalClaimAmount']}
                    </p>
                  </div>
                )}
              </div>

              {/* Type of Damage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Damage *
                </label>
                <select
                  value={formData.needsAnalysis.currentSituation.claimsHistory.damageType || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    needsAnalysis: {
                      ...prev.needsAnalysis,
                      currentSituation: {
                        ...prev.needsAnalysis.currentSituation,
                        claimsHistory: {
                          ...prev.needsAnalysis.currentSituation.claimsHistory,
                          damageType: e.target.value
                        }
                      }
                    }
                  }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['needsAnalysis.currentSituation.claimsHistory.damageType'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type of damage</option>
                  <option value="hail">Hail</option>
                  <option value="windscreen">Windscreen</option>
                  <option value="accident">Accident</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors['needsAnalysis.currentSituation.claimsHistory.damageType'] && (
                  <div className="mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {validationErrors['needsAnalysis.currentSituation.claimsHistory.damageType']}
                    </p>
                  </div>
                )}
              </div>

              {/* Other Damage Type Specification */}
              {formData.needsAnalysis.currentSituation.claimsHistory.damageType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify the type of damage *
                  </label>
                  <input
                    type="text"
                    value={formData.needsAnalysis.currentSituation.claimsHistory.damageTypeOther || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        currentSituation: {
                          ...prev.needsAnalysis.currentSituation,
                          claimsHistory: {
                            ...prev.needsAnalysis.currentSituation.claimsHistory,
                            damageTypeOther: e.target.value
                          }
                        }
                      }
                    }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors['needsAnalysis.currentSituation.claimsHistory.damageTypeOther'] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Please specify the type of damage"
                  />
                  {validationErrors['needsAnalysis.currentSituation.claimsHistory.damageTypeOther'] && (
                    <div className="mt-2 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600">
                        {validationErrors['needsAnalysis.currentSituation.claimsHistory.damageTypeOther']}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Short Description of Incident */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description of the Incident *
                  <span className="text-xs text-gray-500 block mt-1">Please describe the incident in 1-2 sentences</span>
                </label>
                <textarea
                  value={formData.needsAnalysis.currentSituation.claimsHistory.incidentDescription || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    needsAnalysis: {
                      ...prev.needsAnalysis,
                      currentSituation: {
                        ...prev.needsAnalysis.currentSituation,
                        claimsHistory: {
                          ...prev.needsAnalysis.currentSituation.claimsHistory,
                          incidentDescription: e.target.value
                        }
                      }
                    }
                  }))}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['needsAnalysis.currentSituation.claimsHistory.incidentDescription'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Briefly describe what happened..."
                  maxLength={300}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {(formData.needsAnalysis.currentSituation.claimsHistory.incidentDescription || '').length}/300 characters
                </div>
                {validationErrors['needsAnalysis.currentSituation.claimsHistory.incidentDescription'] && (
                  <div className="mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      {validationErrors['needsAnalysis.currentSituation.claimsHistory.incidentDescription']}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Coverage Needs Assessment Step
  const renderCoverageNeedsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Coverage Requirements</h3>
      
      <div className="space-y-4">
        {/* Coverage Level */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What level of coverage do you prefer? *
          </label>
          <div className="space-y-2">
            {insuranceType === 'auto' ? (
              <>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="comprehensive"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'comprehensive'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as any
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Comprehensive Cover - Complete protection including damage, theft, and third-party liability</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="third-party-theft"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'third-party-theft'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as any
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Third Party and Theft Cover - Covers theft and damage to other vehicles/property</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="third-party-only"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'third-party-only'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as any
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Third Party only Cover - Covers only damage to other vehicles/property</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="basic"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'basic'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as 'basic' | 'comprehensive' | 'premium'
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Basic - Essential coverage only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="comprehensive"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'comprehensive'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as 'basic' | 'comprehensive' | 'premium'
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Comprehensive - Standard protection</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="coverageLevel"
                    value="premium"
                    checked={formData.needsAnalysis.coveragePreferences.coverageLevel === 'premium'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          coverageLevel: e.target.value as 'basic' | 'comprehensive' | 'premium'
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Premium - Maximum protection with extras</span>
                </label>
              </>
            )}
          </div>
          {validationErrors['needsAnalysis.coveragePreferences.coverageLevel'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.coveragePreferences.coverageLevel']}
              </p>
            </div>
          )}
        </div>

        {/* Preferred Excess */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Excess Amount (Higher excess = Lower premium) *
            <span className="text-xs text-gray-500 block mt-1">Enter your preferred excess amount in Rands (R)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">R</span>
            <input
              type="number"
              min="0"
              step="500"
              value={formData.needsAnalysis.coveragePreferences.preferredExcess || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                needsAnalysis: {
                  ...prev.needsAnalysis,
                  coveragePreferences: {
                    ...prev.needsAnalysis.coveragePreferences,
                    preferredExcess: e.target.value
                  }
                }
              }))}
              className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors['needsAnalysis.coveragePreferences.preferredExcess'] 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              placeholder="e.g., 5000"
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 Tip: A higher excess typically results in a lower monthly premium
          </p>
          {validationErrors['needsAnalysis.coveragePreferences.preferredExcess'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.coveragePreferences.preferredExcess']}
              </p>
            </div>
          )}
        </div>

        {/* Additional Cover Requirements */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {insuranceType === 'auto' ? 'Select additional cover options' : 'Do you require any additional cover?'}
          </label>
          {insuranceType === 'auto' ? (
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="trailer"
                  checked={formData.needsAnalysis.coveragePreferences.additionalCoverage.includes('trailer')}
                  onChange={(e) => {
                    const newCoverage = e.target.checked
                      ? [...formData.needsAnalysis.coveragePreferences.additionalCoverage, 'trailer']
                      : formData.needsAnalysis.coveragePreferences.additionalCoverage.filter(c => c !== 'trailer');
                    setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          additionalCoverage: newCoverage
                        }
                      }
                    }));
                  }}
                  className="mr-2"
                />
                <span>Trailer Cover - Protection for your trailer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="tire"
                  checked={formData.needsAnalysis.coveragePreferences.additionalCoverage.includes('tire')}
                  onChange={(e) => {
                    const newCoverage = e.target.checked
                      ? [...formData.needsAnalysis.coveragePreferences.additionalCoverage, 'tire']
                      : formData.needsAnalysis.coveragePreferences.additionalCoverage.filter(c => c !== 'tire');
                    setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          additionalCoverage: newCoverage
                        }
                      }
                    }));
                  }}
                  className="mr-2"
                />
                <span>Tire Cover - Coverage for tire damage and replacement</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="accidental-damage"
                  checked={formData.needsAnalysis.coveragePreferences.additionalCoverage.includes('accidental-damage')}
                  onChange={(e) => {
                    const newCoverage = e.target.checked
                      ? [...formData.needsAnalysis.coveragePreferences.additionalCoverage, 'accidental-damage']
                      : formData.needsAnalysis.coveragePreferences.additionalCoverage.filter(c => c !== 'accidental-damage');
                    setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        coveragePreferences: {
                          ...prev.needsAnalysis.coveragePreferences,
                          additionalCoverage: newCoverage
                        }
                      }
                    }));
                  }}
                  className="mr-2"
                />
                <span>Accidental Damage - Coverage for accidental damage to your vehicle</span>
              </label>
            </div>
          ) : (
            <>
              <textarea
                value={formData.needsAnalysis.coveragePreferences.additionalCoverRequirements || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    coveragePreferences: {
                      ...prev.needsAnalysis.coveragePreferences,
                      additionalCoverRequirements: e.target.value
                    }
                  }
                }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe any additional cover you need (e.g., windscreen cover, hail damage, theft of contents, roadside assistance, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Specify any specific coverage you'd like to include beyond standard comprehensive insurance
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Function to render insurance-specific information step
  const renderInsuranceSpecificStep = () => {
    // Different form fields based on insurance type
    if (insuranceType === 'auto') {
      // Auto insurance specific fields
      return (
        <div className="space-y-6">
          {/* Vehicle Year and Make Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vehicle Year *
              </label>
              {/* Dropdown for vehicle year (last 25 years) */}
              <select
                value={formData.insuranceInfo.vehicleYear || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'vehicleYear', e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  validationErrors['insuranceInfo.vehicleYear'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <option value="">Select Year</option>
                {/* Generate years from 2024 back to 2000 */}
                {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {validationErrors['insuranceInfo.vehicleYear'] && (
                <div className="mt-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    {validationErrors['insuranceInfo.vehicleYear']}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vehicle Make *
              </label>
              {/* Dropdown for popular car makes in South Africa */}
              <select
                value={formData.insuranceInfo.vehicleMake || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'vehicleMake', e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  validationErrors['insuranceInfo.vehicleMake'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <option value="">Select Make</option>
                {/* Popular car brands in South Africa */}
                <option value="toyota">Toyota</option>
                <option value="volkswagen">Volkswagen</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="audi">Audi</option>
                <option value="ford">Ford</option>
                <option value="hyundai">Hyundai</option>
                <option value="nissan">Nissan</option>
              </select>
              {validationErrors['insuranceInfo.vehicleMake'] && (
                <div className="mt-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    {validationErrors['insuranceInfo.vehicleMake']}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Model and Value Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vehicle Model *
              </label>
              {/* Text input for vehicle model */}
              <input
                type="text"
                value={formData.insuranceInfo.vehicleModel || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'vehicleModel', e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                  validationErrors['insuranceInfo.vehicleModel'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
                placeholder="e.g., Corolla, Golf, 3 Series"
              />
              {validationErrors['insuranceInfo.vehicleModel'] && (
                <div className="mt-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    {validationErrors['insuranceInfo.vehicleModel']}
                  </p>
                </div>
              )}
            </div>
            {/* Vehicle value field removed — handled in Vehicle Details component */}
          </div>

          {/* M&M Code (optional) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              M&M Code (Optional)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              You can find the M&M code on your vehicle purchase invoice. This ensures your vehicle is insured at the correct market value.
            </p>
            <input
              type="text"
              value={formData.insuranceInfo.mmCode || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'mmCode', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              placeholder="Enter M&M code from invoice"
            />
          </div>
        </div>
      );
    }

    // Generic form for other insurance types (home, commercial property, health, business)
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Coverage Amount Needed *
          </label>
          {/* Coverage amount dropdown in ZAR */}
          <select
            value={formData.insuranceInfo.coverageAmount || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'coverageAmount', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
              validationErrors['insuranceInfo.coverageAmount'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200'
            }`}
          >
            <option value="">Select Coverage Amount</option>
            {/* Coverage amounts in South African Rand */}
            <option value="500000">R500,000</option>
            <option value="1000000">R1,000,000</option>
            <option value="2000000">R2,000,000</option>
            <option value="5000000">R5,000,000</option>
            <option value="10000000">R10,000,000+</option>
          </select>
          {validationErrors['insuranceInfo.coverageAmount'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['insuranceInfo.coverageAmount']}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Current Insurance Status *
          </label>
          {/* Current insurance status for non-auto insurance */}
          <select
            value={formData.insuranceInfo.currentInsurance || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'currentInsurance', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
              validationErrors['insuranceInfo.currentInsurance'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200'
            }`}
          >
            <option value="">Select Status</option>
            <option value="currently-insured">Currently Insured</option>
            <option value="expiring-soon">Insurance Expiring Soon</option>
            <option value="no-insurance">No Current Insurance</option>
            <option value="looking-to-switch">Looking to Switch</option>
          </select>
          {validationErrors['insuranceInfo.currentInsurance'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['insuranceInfo.currentInsurance']}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Vehicle Details Step (for Auto Insurance)
  const renderVehicleDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Vehicle Information</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Make *
            </label>
            <input
              type="text"
              placeholder="e.g., Toyota, BMW, Mercedes"
              value={formData.insuranceInfo.vehicleMake || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'vehicleMake', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Model *
            </label>
            <input
              type="text"
              placeholder="e.g., Corolla, 3 Series, C-Class"
              value={formData.insuranceInfo.vehicleModel || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'vehicleModel', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Manufacture *
            </label>
            <select
              value={formData.insuranceInfo.vehicleYear || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'vehicleYear', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* M&M Code (Vehicle Value) input removed; M&M code remains in the dedicated field above */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Use of Vehicle *
          </label>
          <select
            value={formData.insuranceInfo.vehicleUsage || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'vehicleUsage', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Primary Use</option>
            <option value="private-domestic">Private & Domestic Use</option>
            <option value="business">Business Use</option>
          </select>
        </div>

        {/* Driver Same as Insured Question */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Is the driver the same person as the insured? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="driverSameAsInsured"
                value="true"
                checked={formData.insuranceInfo.driverSameAsInsured === true}
                onChange={(e) => updateFormData('insuranceInfo', 'driverSameAsInsured', e.target.value === 'true')}
                className="mr-2"
              />
              <span>Yes, I am the driver</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="driverSameAsInsured"
                value="false"
                checked={formData.insuranceInfo.driverSameAsInsured === false}
                onChange={(e) => updateFormData('insuranceInfo', 'driverSameAsInsured', e.target.value === 'true')}
                className="mr-2"
              />
              <span>No, someone else will be driving</span>
            </label>
          </div>
        </div>

        {/* Additional Driver Information (shown when driver is different) */}
        {formData.insuranceInfo.driverSameAsInsured === false && (
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h4>
            
            {/* Driver Full Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's First Name *
                </label>
                <input
                  type="text"
                  value={formData.insuranceInfo.driverFirstName || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverFirstName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverFirstName'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter driver's first name"
                />
                {validationErrors['insuranceInfo.driverFirstName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverFirstName']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's Last Name *
                </label>
                <input
                  type="text"
                  value={formData.insuranceInfo.driverLastName || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverLastName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverLastName'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter driver's last name"
                />
                {validationErrors['insuranceInfo.driverLastName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverLastName']}
                  </p>
                )}
              </div>
            </div>

            {/* Driver ID Number and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's ID Number *
                </label>
                <input
                  type="text"
                  value={formData.insuranceInfo.driverIdNumber || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverIdNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverIdNumber'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter driver's ID number"
                />
                {validationErrors['insuranceInfo.driverIdNumber'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverIdNumber']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.insuranceInfo.driverContactNumber || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverContactNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverContactNumber'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., 0821234567"
                />
                {validationErrors['insuranceInfo.driverContactNumber'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverContactNumber']}
                  </p>
                )}
              </div>
            </div>

            {/* Driver Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver's Occupation *
              </label>
              <select
                value={formData.insuranceInfo.driverOccupation || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'driverOccupation', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.driverOccupation'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Occupation</option>
                <option value="self-employed">Self-Employed</option>
                <option value="employed">Work for Employer</option>
                <option value="pensioner">Pensioner</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Student</option>
              </select>
              {validationErrors['insuranceInfo.driverOccupation'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.driverOccupation']}
                </p>
              )}
            </div>

            {/* Driver License Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License Type *
                </label>
                <select
                  value={formData.insuranceInfo.driverLicenseType || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverLicenseType', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverLicenseType'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select License Type</option>
                  <optgroup label="South African Licenses">
                    <option value="code-a1">Code A1 (Motorcycles up to 125cc)</option>
                    <option value="code-a">Code A (Motorcycles)</option>
                    <option value="code-b">Code B (Light Motor Vehicles)</option>
                    <option value="code-c1">Code C1 (Light Trucks up to 16,000kg)</option>
                    <option value="code-c">Code C (Heavy Trucks)</option>
                    <option value="code-eb">Code EB (Light Vehicle with Trailer)</option>
                    <option value="code-ec1">Code EC1 (Light Truck with Trailer)</option>
                    <option value="code-ec">Code EC (Heavy Truck with Trailer)</option>
                  </optgroup>
                  <option value="international">International License</option>
                </select>
                {validationErrors['insuranceInfo.driverLicenseType'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverLicenseType']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.insuranceInfo.driverLicenseIssueDate || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverLicenseIssueDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverLicenseIssueDate'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.driverLicenseIssueDate'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverLicenseIssueDate']}
                  </p>
                )}
              </div>
            </div>

            {/* International License Upload */}
            {formData.insuranceInfo.driverLicenseType === 'international' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify country and attach a copy of the license *
                </label>
                <input
                  type="text"
                  value={formData.insuranceInfo.internationalLicenseCountry || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'internationalLicenseCountry', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 ${
                    validationErrors['insuranceInfo.internationalLicenseCountry'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Country of license issuance"
                />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Handle file upload
                      updateFormData('insuranceInfo', 'internationalLicenseFile', file.name);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a clear copy of the license (PDF or image)</p>
                {validationErrors['insuranceInfo.internationalLicenseCountry'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.internationalLicenseCountry']}
                  </p>
                )}
              </div>
            )}

            {/* Driver Claims History */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver's Claims History in Last 12 Months *
              </label>
              <select
                value={formData.insuranceInfo.driverClaimsHistory || ''}
                onChange={(e) => {
                  updateFormData('insuranceInfo', 'driverClaimsHistory', e.target.value);
                  // Clear validation error when user makes a selection
                  if (e.target.value) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors['insuranceInfo.driverClaimsHistory'];
                      return newErrors;
                    });
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.driverClaimsHistory'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Claims History</option>
                <option value="none">No Claims</option>
                <option value="one">One Claim</option>
                <option value="two">Two Claims</option>
                <option value="more-than-two">More than Two Claims</option>
              </select>
              {validationErrors['insuranceInfo.driverClaimsHistory'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.driverClaimsHistory']}
                </p>
              )}
            </div>

            {/* Number of Claims (shown when more than two claims) */}
            {formData.insuranceInfo.driverClaimsHistory === 'more-than-two' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many claims exactly? *
                </label>
                <input
                  type="number"
                  min="3"
                  value={formData.insuranceInfo.driverNumberOfClaims || ''}
                  onChange={(e) => {
                    updateFormData('insuranceInfo', 'driverNumberOfClaims', e.target.value);
                    // Clear validation error when user enters a value
                    if (e.target.value) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors['insuranceInfo.driverNumberOfClaims'];
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverNumberOfClaims'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter number of claims"
                />
                {validationErrors['insuranceInfo.driverNumberOfClaims'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverNumberOfClaims']}
                  </p>
                )}
              </div>
            )}

            {/* Relationship and Marital Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship with the Insured *
                </label>
                <select
                  value={formData.insuranceInfo.driverRelationship || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverRelationship', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverRelationship'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="family-member">Other Family Member</option>
                  <option value="friend">Friend</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors['insuranceInfo.driverRelationship'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverRelationship']}
                  </p>
                )}
                
                {/* Conditional input for "Other" relationship */}
                {formData.insuranceInfo.driverRelationship === 'other' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify the relationship *
                    </label>
                    <input
                      type="text"
                      value={formData.insuranceInfo.driverRelationshipOther || ''}
                      onChange={(e) => updateFormData('insuranceInfo', 'driverRelationshipOther', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors['insuranceInfo.driverRelationshipOther'] 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter relationship"
                    />
                    {validationErrors['insuranceInfo.driverRelationshipOther'] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors['insuranceInfo.driverRelationshipOther']}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's Marital Status *
                </label>
                <select
                  value={formData.insuranceInfo.driverMaritalStatus || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'driverMaritalStatus', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.driverMaritalStatus'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Marital Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
                {validationErrors['insuranceInfo.driverMaritalStatus'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.driverMaritalStatus']}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // E-Hailing Details Step (for E-Hailing Insurance)
  const renderEHailingDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">E-Hailing Service Details</h3>
      
      <div className="space-y-4">
        {/* E-Hailing Platform */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Platform Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary E-Hailing Platform *
              </label>
              <select
                value={formData.insuranceInfo.primaryPlatform || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'primaryPlatform', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['primaryPlatform'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Platform</option>
                <option value="uber">Uber</option>
                <option value="bolt">Bolt (Taxify)</option>
                <option value="didi">DiDi</option>
                <option value="meter-taxi">Meter Taxi</option>
                <option value="multiple">Multiple Platforms</option>
                <option value="other">Other</option>
              </select>
              {validationErrors['primaryPlatform'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['primaryPlatform']}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Rating on Platform
              </label>
              <select
                value={formData.insuranceInfo.driverRating || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'driverRating', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Rating</option>
                <option value="4.9-5.0">4.9 - 5.0 stars</option>
                <option value="4.7-4.8">4.7 - 4.8 stars</option>
                <option value="4.5-4.6">4.5 - 4.6 stars</option>
                <option value="4.0-4.4">4.0 - 4.4 stars</option>
                <option value="below-4.0">Below 4.0 stars</option>
                <option value="new-driver">New driver (no rating yet)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operating Schedule */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operating Schedule</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Hours per Week *
              </label>
              <select
                value={formData.insuranceInfo.weeklyHours || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'weeklyHours', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['weeklyHours'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Hours</option>
                <option value="under-20">Under 20 hours</option>
                <option value="20-30">20-30 hours</option>
                <option value="30-40">30-40 hours</option>
                <option value="40-50">40-50 hours</option>
                <option value="over-50">Over 50 hours</option>
              </select>
              {validationErrors['weeklyHours'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['weeklyHours']}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Operating Times
              </label>
              <select
                value={formData.insuranceInfo.operatingTimes || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'operatingTimes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Times</option>
                <option value="day-shift">Day shift (6am - 6pm)</option>
                <option value="night-shift">Night shift (6pm - 6am)</option>
                <option value="peak-hours">Peak hours only</option>
                <option value="weekends">Weekends only</option>
                <option value="24-7">24/7 availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operating Areas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operating Areas</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Operating Areas (Select all that apply) *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'johannesburg-cbd', label: 'Johannesburg CBD' },
                  { value: 'sandton', label: 'Sandton' },
                  { value: 'cape-town-cbd', label: 'Cape Town CBD' },
                  { value: 'durban-cbd', label: 'Durban CBD' },
                  { value: 'pretoria', label: 'Pretoria' },
                  { value: 'airports', label: 'Airports (OR Tambo, Cape Town International)' },
                  { value: 'townships', label: 'Township Areas' },
                  { value: 'suburbs', label: 'Suburban Areas' },
                  { value: 'highways', label: 'Highway Routes' },
                  { value: 'other-cities', label: 'Other Major Cities' }
                ].map((area) => (
                  <label key={area.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={area.value}
                      checked={(formData.insuranceInfo.operatingAreas || []).includes(area.value)}
                      onChange={(e) => {
                        const currentAreas = formData.insuranceInfo.operatingAreas || [];
                        const updatedAreas = e.target.checked
                          ? [...currentAreas, area.value]
                          : currentAreas.filter((a: string) => a !== area.value);
                        updateFormData('insuranceInfo', 'operatingAreas', updatedAreas);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area.label}</span>
                  </label>
                ))}
              </div>
              {validationErrors['operatingAreas'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['operatingAreas']}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Income & Financial Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Income Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Monthly Income from E-Hailing *
              </label>
              <select
                value={formData.insuranceInfo.monthlyIncome || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'monthlyIncome', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['monthlyIncome'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Income Range</option>
                <option value="under-5000">Under R5,000</option>
                <option value="5000-10000">R5,000 - R10,000</option>
                <option value="10000-15000">R10,000 - R15,000</option>
                <option value="15000-25000">R15,000 - R25,000</option>
                <option value="25000-35000">R25,000 - R35,000</option>
                <option value="over-35000">Over R35,000</option>
              </select>
              {validationErrors['monthlyIncome'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['monthlyIncome']}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Ownership Status *
              </label>
              <select
                value={formData.insuranceInfo.vehicleOwnership || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'vehicleOwnership', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['vehicleOwnership'] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Ownership</option>
                <option value="own-outright">Own outright</option>
                <option value="finance-agreement">Under finance agreement</option>
                <option value="rent-to-own">Rent-to-own agreement</option>
                <option value="rental">Rental vehicle</option>
                <option value="company-vehicle">Company/Fleet vehicle</option>
              </select>
              {validationErrors['vehicleOwnership'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['vehicleOwnership']}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Safety & Security Features */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Safety & Security Features</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Features in Vehicle (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'dash-cam', label: 'Dash Camera' },
                  { value: 'gps-tracking', label: 'GPS Tracking' },
                  { value: 'panic-button', label: 'Panic Button' },
                  { value: 'security-film', label: 'Window Security Film' },
                  { value: 'first-aid-kit', label: 'First Aid Kit' },
                  { value: 'fire-extinguisher', label: 'Fire Extinguisher' },
                  { value: 'immobilizer', label: 'Engine Immobilizer' },
                  { value: 'alarm-system', label: 'Car Alarm System' }
                ].map((feature) => (
                  <label key={feature.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={feature.value}
                      checked={(formData.insuranceInfo.safetyFeatures || []).includes(feature.value)}
                      onChange={(e) => {
                        const currentFeatures = formData.insuranceInfo.safetyFeatures || [];
                        const updatedFeatures = e.target.checked
                          ? [...currentFeatures, feature.value]
                          : currentFeatures.filter((f: string) => f !== feature.value);
                        updateFormData('insuranceInfo', 'safetyFeatures', updatedFeatures);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Property Details Step (for Home and Commercial Property Insurance)
  const renderPropertyDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Property Information</h3>
      
      <div className="space-y-6">
        {/* Same as Residential Address Question */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Is the property address the same as your residential address? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="propertySameAsResidential"
                value="true"
                checked={formData.insuranceInfo.propertySameAsResidential === true}
                onChange={(e) => {
                  const isSame = e.target.value === 'true';
                  updateFormData('insuranceInfo', 'propertySameAsResidential', String(isSame));
                  // If same, copy residential address to property address
                  if (isSame) {
                    updateFormData('insuranceInfo', 'propertyStreetNumber', formData.personalInfo.streetNumber);
                    updateFormData('insuranceInfo', 'propertyStreetName', formData.personalInfo.streetName);
                    updateFormData('insuranceInfo', 'propertySuburb', formData.personalInfo.village);
                    updateFormData('insuranceInfo', 'propertyCity', formData.personalInfo.village);
                    updateFormData('insuranceInfo', 'propertyPostalCode', formData.personalInfo.areaCode);
                    updateFormData('insuranceInfo', 'propertyProvince', formData.personalInfo.province);
                  }
                }}
                className="mr-2"
              />
              <span>Yes, same address</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="propertySameAsResidential"
                value="false"
                checked={formData.insuranceInfo.propertySameAsResidential === false}
                onChange={(e) => {
                  updateFormData('insuranceInfo', 'propertySameAsResidential', String(e.target.value === 'true'));
                }}
                className="mr-2"
              />
              <span>No, different address</span>
            </label>
          </div>
          {validationErrors['insuranceInfo.propertySameAsResidential'] && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors['insuranceInfo.propertySameAsResidential']}
            </p>
          )}
        </div>

        {/* Physical Address Section - Only show if different address */}
        {formData.insuranceInfo.propertySameAsResidential === false && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Property Physical Address *</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123"
                  value={formData.insuranceInfo.propertyStreetNumber || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertyStreetNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertyStreetNumber'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.propertyStreetNumber'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertyStreetNumber']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Road"
                  value={formData.insuranceInfo.propertyStreetName || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertyStreetName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertyStreetName'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.propertyStreetName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertyStreetName']}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suburb/Village *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sandton"
                  value={formData.insuranceInfo.propertySuburb || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertySuburb', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertySuburb'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.propertySuburb'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertySuburb']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Johannesburg"
                  value={formData.insuranceInfo.propertyCity || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertyCity', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertyCity'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.propertyCity'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertyCity']}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2196"
                  maxLength={4}
                  value={formData.insuranceInfo.propertyPostalCode || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertyPostalCode', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertyPostalCode'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors['insuranceInfo.propertyPostalCode'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertyPostalCode']}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <select
                value={formData.insuranceInfo.propertyProvince || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'propertyProvince', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.propertyProvince'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Province</option>
                <option value="western-cape">Western Cape</option>
                <option value="gauteng">Gauteng</option>
                <option value="kwazulu-natal">KwaZulu-Natal</option>
                <option value="eastern-cape">Eastern Cape</option>
                <option value="mpumalanga">Mpumalanga</option>
                <option value="limpopo">Limpopo</option>
                <option value="north-west">North West</option>
                <option value="free-state">Free State</option>
                <option value="northern-cape">Northern Cape</option>
              </select>
              {validationErrors['insuranceInfo.propertyProvince'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.propertyProvince']}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Property Type and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building Type *
            </label>
            <select
              value={formData.insuranceInfo.propertyType || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'propertyType', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors['insuranceInfo.propertyType'] 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            >
              <option value="">Select Building Type</option>
              {insuranceType === 'commercial-property' ? (
                <>
                  <option value="office">Office Building</option>
                  <option value="retail">Retail Space</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="industrial">Industrial Property</option>
                  <option value="mixed-use">Mixed Use</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="medical">Medical/Healthcare</option>
                  <option value="other-commercial">Other Commercial</option>
                  <option value="other">Other</option>
                </>
              ) : (
                <>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="cluster">Cluster Home</option>
                  <option value="estate">Estate Property</option>
                  <option value="duplex">Duplex</option>
                  <option value="flat">Flat</option>
                  <option value="shack">Shack</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>
            {validationErrors['insuranceInfo.propertyType'] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors['insuranceInfo.propertyType']}
              </p>
            )}
            
            {/* Conditional input for "Other" building type */}
            {formData.insuranceInfo.propertyType === 'other' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please describe the building type *
                </label>
                <textarea
                  value={formData.insuranceInfo.propertyTypeOther || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'propertyTypeOther', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors['insuranceInfo.propertyTypeOther'] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Describe the building type..."
                  rows={3}
                />
                {validationErrors['insuranceInfo.propertyTypeOther'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['insuranceInfo.propertyTypeOther']}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Value (Building) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R</span>
              <input
                type="number"
                placeholder="Enter property value"
                value={formData.insuranceInfo.propertyValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'propertyValue', e.target.value)}
                className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.propertyValue'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                min="0"
              />
            </div>
            {validationErrors['insuranceInfo.propertyValue'] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors['insuranceInfo.propertyValue']}
              </p>
            )}
          </div>
        </div>

        {/* Building Construction Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Building Construction Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wall Construction Material *
              </label>
              <select
                value={formData.insuranceInfo.wallMaterial || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'wallMaterial', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.wallMaterial'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Wall Material</option>
                <option value="brick">Brick</option>
                <option value="concrete">Concrete</option>
                <option value="stone">Stone</option>
                <option value="wood">Wood/Timber</option>
                <option value="metal">Metal/Steel</option>
                <option value="prefab">Pre-fabricated</option>
                <option value="mixed">Mixed Materials</option>
                <option value="other">Other</option>
              </select>
              {validationErrors['insuranceInfo.wallMaterial'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.wallMaterial']}
                </p>
              )}
              
              {/* Conditional input for "Other" wall material */}
              {formData.insuranceInfo.wallMaterial === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify the wall material *
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceInfo.wallMaterialOther || ''}
                    onChange={(e) => updateFormData('insuranceInfo', 'wallMaterialOther', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors['insuranceInfo.wallMaterialOther'] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Specify wall material..."
                  />
                  {validationErrors['insuranceInfo.wallMaterialOther'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors['insuranceInfo.wallMaterialOther']}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roof Material *
              </label>
              <select
                value={formData.insuranceInfo.roofMaterial || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'roofMaterial', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.roofMaterial'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Roof Material</option>
                <option value="tiles">Tiles (Clay/Concrete)</option>
                <option value="slate">Slate</option>
                <option value="metal-sheets">Metal Sheets/Corrugated Iron</option>
                <option value="thatch">Thatch</option>
                <option value="asbestos">Asbestos</option>
                <option value="flat-concrete">Flat Concrete</option>
                <option value="shingles">Shingles</option>
                <option value="other">Other</option>
              </select>
              {validationErrors['insuranceInfo.roofMaterial'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.roofMaterial']}
                </p>
              )}
              
              {/* Conditional input for "Other" roof material */}
              {formData.insuranceInfo.roofMaterial === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify the roof material *
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceInfo.roofMaterialOther || ''}
                    onChange={(e) => updateFormData('insuranceInfo', 'roofMaterialOther', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors['insuranceInfo.roofMaterialOther'] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Specify roof material..."
                  />
                  {validationErrors['insuranceInfo.roofMaterialOther'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors['insuranceInfo.roofMaterialOther']}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built/Age of Building *
              </label>
              <input
                type="number"
                placeholder="e.g., 2010"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.insuranceInfo.yearBuilt || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'yearBuilt', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.yearBuilt'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors['insuranceInfo.yearBuilt'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.yearBuilt']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Storeys/Floors *
              </label>
              <select
                value={formData.insuranceInfo.numberOfStoreys || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'numberOfStoreys', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.numberOfStoreys'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Number of Storeys</option>
                <option value="1">Single Storey (1 Floor)</option>
                <option value="2">Two Storeys (2 Floors)</option>
                <option value="3">Three Storeys (3 Floors)</option>
                <option value="4">Four Storeys (4 Floors)</option>
                <option value="5+">Five or More Storeys (5+ Floors)</option>
              </select>
              {validationErrors['insuranceInfo.numberOfStoreys'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.numberOfStoreys']}
                </p>
              )}
              
              {/* Conditional input for "5+" storeys */}
              {formData.insuranceInfo.numberOfStoreys === '5+' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify the exact number of storeys/floors *
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={formData.insuranceInfo.numberOfStoreysExact || ''}
                    onChange={(e) => updateFormData('insuranceInfo', 'numberOfStoreysExact', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors['insuranceInfo.numberOfStoreysExact'] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter exact number of storeys..."
                  />
                  {validationErrors['insuranceInfo.numberOfStoreysExact'] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors['insuranceInfo.numberOfStoreysExact']}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Floor Area (Square Meters) *
            </label>
            <input
              type="number"
              placeholder="e.g., 150"
              min="1"
              value={formData.insuranceInfo.floorArea || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'floorArea', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors['insuranceInfo.floorArea'] 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {validationErrors['insuranceInfo.floorArea'] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors['insuranceInfo.floorArea']}
              </p>
            )}
          </div>
        </div>

        {/* Building Usage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Use of Building *
          </label>
          <select
            value={formData.insuranceInfo.buildingUse || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'buildingUse', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors['insuranceInfo.buildingUse'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">Select Building Use</option>
            <option value="residential-owner">Residential - Owner Occupied</option>
            <option value="residential-rented">Residential - Rented Out</option>
            <option value="commercial">Commercial/Business</option>
            <option value="mixed">Mixed Use (Residential & Commercial)</option>
            <option value="vacant">Vacant/Unoccupied</option>
          </select>
          {validationErrors['insuranceInfo.buildingUse'] && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors['insuranceInfo.buildingUse']}
            </p>
          )}
        </div>

        {/* Commercial Use Details */}
        {(formData.insuranceInfo.buildingUse === 'commercial' || formData.insuranceInfo.buildingUse === 'mixed') && (
          <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Commercial Use Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Business Conducted *
              </label>
              <input
                type="text"
                placeholder="e.g., Retail shop, Restaurant, Office"
                value={formData.insuranceInfo.businessType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'businessType', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors['insuranceInfo.businessType'] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors['insuranceInfo.businessType'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors['insuranceInfo.businessType']}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees on Premises
              </label>
              <input
                type="number"
                placeholder="e.g., 10"
                min="0"
                value={formData.insuranceInfo.numberOfEmployees || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'numberOfEmployees', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Building Condition and Features */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Building Condition *
            </label>
            <select
              value={formData.insuranceInfo.buildingCondition || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'buildingCondition', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors['insuranceInfo.buildingCondition'] 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            >
              <option value="">Select Condition</option>
              <option value="excellent">Excellent - Like New</option>
              <option value="good">Good - Well Maintained</option>
              <option value="fair">Fair - Some Wear and Tear</option>
              <option value="poor">Poor - Requires Repairs</option>
            </select>
            {validationErrors['insuranceInfo.buildingCondition'] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors['insuranceInfo.buildingCondition']}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Building Features or Information
            </label>
            <textarea
              rows={4}
              placeholder="Please provide any additional information about the building (e.g., renovations, special features, annexes, outbuildings, swimming pool, etc.)"
              value={formData.insuranceInfo.additionalBuildingInfo || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'additionalBuildingInfo', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Business Details Step (for Business Insurance types)
  const renderBusinessDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Business Information</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              placeholder="Your business name"
              value={formData.insuranceInfo.businessName || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'businessName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('businessName') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('businessName')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Registration Number
            </label>
            <input
              type="text"
              placeholder="e.g., 2021/123456/07"
              value={formData.insuranceInfo.businessRegistration || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'businessRegistration', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={formData.insuranceInfo.businessType || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'businessType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Business Type</option>
            <option value="sole-proprietorship">Sole Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="close-corporation">Close Corporation (CC)</option>
            <option value="private-company">Private Company (Pty Ltd)</option>
            <option value="public-company">Public Company (Ltd)</option>
            <option value="trust">Trust</option>
            <option value="cooperative">Cooperative</option>
            <option value="non-profit">Non-Profit Organization (NPO)</option>
            <option value="section-21">Section 21 Company</option>
            <option value="other">Other</option>
          </select>
          {getFieldError('businessType') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('businessType')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Sector *
            </label>
            <select
              value={formData.insuranceInfo.industrySector || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'industrySector', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="professional-services">Professional Services</option>
              <option value="retail">Retail & Trade</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="hospitality">Hospitality & Tourism</option>
              <option value="construction">Construction</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="transport">Transport & Logistics</option>
              <option value="agriculture">Agriculture</option>
              <option value="other">Other</option>
            </select>
            {getFieldError('industrySector') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('industrySector')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees *
            </label>
            <select
              value={formData.insuranceInfo.employeeCount || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'employeeCount', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Range</option>
              <option value="1-5">1-5 employees</option>
              <option value="6-20">6-20 employees</option>
              <option value="21-50">21-50 employees</option>
              <option value="51-100">51-100 employees</option>
              <option value="100+">100+ employees</option>
            </select>
            {getFieldError('employeeCount') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('employeeCount')}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Turnover *
          </label>
          <select
            value={formData.insuranceInfo.annualTurnover || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'annualTurnover', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Turnover Range</option>
            <option value="0-1000000">R0 - R1,000,000</option>
            <option value="1000000-5000000">R1,000,000 - R5,000,000</option>
            <option value="5000000-20000000">R5,000,000 - R20,000,000</option>
            <option value="20000000-50000000">R20,000,000 - R50,000,000</option>
            <option value="50000000+">R50,000,000+</option>
          </select>
          {getFieldError('annualTurnover') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('annualTurnover')}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Public Liability Details Step
  const renderLiabilityDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Public Liability Coverage</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coverage Limit Required *
          </label>
          <select
            value={formData.insuranceInfo.liabilityCoverage || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'liabilityCoverage', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Coverage Limit</option>
            <option value="1000000">R1,000,000</option>
            <option value="2000000">R2,000,000</option>
            <option value="5000000">R5,000,000</option>
            <option value="10000000">R10,000,000</option>
            <option value="20000000">R20,000,000+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Activities (Select all that apply) *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Consulting Services', 'Office-based Activities', 'Client Meetings', 'Site Visits',
              'Product Sales', 'Event Management', 'Training/Education', 'Retail Operations'
            ].map((activity) => (
              <label key={activity} className="flex items-center">
                <input
                  type="checkbox"
                  value={activity}
                  checked={formData.insuranceInfo.businessActivities?.includes(activity) || false}
                  onChange={(e) => {
                    const activities = formData.insuranceInfo.businessActivities || [];
                    const updatedActivities = e.target.checked
                      ? [...activities, activity]
                      : activities.filter((a: string) => a !== activity);
                    
                    setFormData(prev => ({
                      ...prev,
                      insuranceInfo: {
                        ...prev.insuranceInfo,
                        businessActivities: updatedActivities
                      }
                    }))
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{activity}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you work with hazardous materials or high-risk activities? *
          </label>
          <select
            value={formData.insuranceInfo.hazardousActivities || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'hazardousActivities', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Option</option>
            <option value="no">No hazardous activities</option>
            <option value="low">Low-risk activities</option>
            <option value="medium">Medium-risk activities</option>
            <option value="high">High-risk activities</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Add placeholder functions for the remaining steps to avoid compilation errors
  // Business Assets Step (for Small Business Insurance)
  const renderBusinessAssetsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Business Assets & Equipment</h3>
      
      <div className="space-y-4">
        {/* Building/Property Assets */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Property & Buildings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Value *
              </label>
              <select
                value={formData.insuranceInfo.buildingValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'buildingValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Building Value</option>
                <option value="0-250000">R0 - R250,000</option>
                <option value="250000-500000">R250,000 - R500,000</option>
                <option value="500000-1000000">R500,000 - R1,000,000</option>
                <option value="1000000-2000000">R1,000,000 - R2,000,000</option>
                <option value="2000000-5000000">R2,000,000 - R5,000,000</option>
                <option value="5000000+">R5,000,000+</option>
                <option value="not-applicable">Not Applicable (Rented)</option>
              </select>
              {getFieldError('buildingValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('buildingValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Ownership
              </label>
              <select
                value={formData.insuranceInfo.buildingOwnership || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'buildingOwnership', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Ownership Type</option>
                <option value="owned">Owned by Business</option>
                <option value="rented">Rented/Leased</option>
                <option value="shared">Shared Ownership</option>
              </select>
            </div>
          </div>
        </div>

        {/* Equipment & Machinery */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Equipment & Machinery</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Equipment Value *
              </label>
              <select
                value={formData.insuranceInfo.officeEquipmentValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'officeEquipmentValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Equipment Value</option>
                <option value="0-25000">R0 - R25,000</option>
                <option value="25000-50000">R25,000 - R50,000</option>
                <option value="50000-100000">R50,000 - R100,000</option>
                <option value="100000-250000">R100,000 - R250,000</option>
                <option value="250000-500000">R250,000 - R500,000</option>
                <option value="500000+">R500,000+</option>
              </select>
              {getFieldError('officeEquipmentValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('officeEquipmentValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialized Equipment Value
              </label>
              <select
                value={formData.insuranceInfo.specializedEquipmentValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'specializedEquipmentValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Equipment Value</option>
                <option value="0">No Specialized Equipment</option>
                <option value="0-50000">R0 - R50,000</option>
                <option value="50000-100000">R50,000 - R100,000</option>
                <option value="100000-250000">R100,000 - R250,000</option>
                <option value="250000-500000">R250,000 - R500,000</option>
                <option value="500000-1000000">R500,000 - R1,000,000</option>
                <option value="1000000+">R1,000,000+</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Types (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'computers', label: 'Computers/IT Equipment' },
                { value: 'furniture', label: 'Office Furniture' },
                { value: 'machinery', label: 'Manufacturing Machinery' },
                { value: 'tools', label: 'Tools & Equipment' },
                { value: 'vehicles', label: 'Business Vehicles' },
                { value: 'kitchen', label: 'Kitchen/Catering Equipment' },
                { value: 'medical', label: 'Medical Equipment' },
                { value: 'security', label: 'Security Equipment' },
                { value: 'other', label: 'Other Equipment' }
              ].map((equipment) => (
                <label key={equipment.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={equipment.value}
                    checked={(formData.insuranceInfo.equipmentTypes || []).includes(equipment.value)}
                    onChange={(e) => {
                      const currentTypes = formData.insuranceInfo.equipmentTypes || [];
                      const updatedTypes = e.target.checked
                        ? [...currentTypes, equipment.value]
                        : currentTypes.filter((t: string) => t !== equipment.value);
                      updateFormData('insuranceInfo', 'equipmentTypes', updatedTypes);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{equipment.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Stock & Inventory */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock & Inventory</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock/Inventory Value *
              </label>
              <select
                value={formData.insuranceInfo.stockValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'stockValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Stock Value</option>
                <option value="0">No Stock/Inventory</option>
                <option value="0-25000">R0 - R25,000</option>
                <option value="25000-50000">R25,000 - R50,000</option>
                <option value="50000-100000">R50,000 - R100,000</option>
                <option value="100000-250000">R100,000 - R250,000</option>
                <option value="250000-500000">R250,000 - R500,000</option>
                <option value="500000-1000000">R500,000 - R1,000,000</option>
                <option value="1000000+">R1,000,000+</option>
              </select>
              {getFieldError('stockValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('stockValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Type
              </label>
              <select
                value={formData.insuranceInfo.stockType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'stockType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Stock Type</option>
                <option value="finished-goods">Finished Goods</option>
                <option value="raw-materials">Raw Materials</option>
                <option value="work-in-progress">Work in Progress</option>
                <option value="retail-merchandise">Retail Merchandise</option>
                <option value="perishable">Perishable Goods</option>
                <option value="hazardous">Hazardous Materials</option>
                <option value="mixed">Mixed Stock Types</option>
              </select>
            </div>
          </div>
        </div>

        {/* Money & Cash Coverage */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Money & Cash Coverage</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Cash on Premises
              </label>
              <select
                value={formData.insuranceInfo.cashOnPremises || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'cashOnPremises', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Cash Amount</option>
                <option value="0-2500">R0 - R2,500</option>
                <option value="2500-5000">R2,500 - R5,000</option>
                <option value="5000-10000">R5,000 - R10,000</option>
                <option value="10000-25000">R10,000 - R25,000</option>
                <option value="25000-50000">R25,000 - R50,000</option>
                <option value="50000+">R50,000+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Money in Transit Coverage
              </label>
              <select
                value={formData.insuranceInfo.moneyInTransit || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'moneyInTransit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Coverage Amount</option>
                <option value="0">No Coverage Needed</option>
                <option value="0-5000">R0 - R5,000</option>
                <option value="5000-10000">R5,000 - R10,000</option>
                <option value="10000-25000">R10,000 - R25,000</option>
                <option value="25000-50000">R25,000 - R50,000</option>
                <option value="50000+">R50,000+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Interruption */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Interruption Coverage</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you require Business Interruption coverage?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requiresBusinessInterruption"
                  value="no"
                  checked={formData.insuranceInfo.requiresBusinessInterruption === 'no'}
                  onChange={(e) => updateFormData('insuranceInfo', 'requiresBusinessInterruption', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No, not required</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requiresBusinessInterruption"
                  value="yes"
                  checked={formData.insuranceInfo.requiresBusinessInterruption === 'yes'}
                  onChange={(e) => updateFormData('insuranceInfo', 'requiresBusinessInterruption', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes, I need Business Interruption coverage</span>
              </label>
            </div>
          </div>

          {/* Business Interruption Details - shown when "Yes" is selected */}
          {formData.insuranceInfo.requiresBusinessInterruption === 'yes' && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Turnover *
                  </label>
                  <select
                    value={formData.insuranceInfo.monthlyTurnover || ''}
                    onChange={(e) => updateFormData('insuranceInfo', 'monthlyTurnover', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Monthly Turnover</option>
                    <option value="0-25000">R0 - R25,000</option>
                    <option value="25000-50000">R25,000 - R50,000</option>
                    <option value="50000-100000">R50,000 - R100,000</option>
                    <option value="100000-250000">R100,000 - R250,000</option>
                    <option value="250000-500000">R250,000 - R500,000</option>
                    <option value="500000+">R500,000+</option>
                  </select>
                  {getFieldError('monthlyTurnover') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('monthlyTurnover')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Period *
                  </label>
                  <select
                    value={formData.insuranceInfo.interruptionPeriod || ''}
                    onChange={(e) => updateFormData('insuranceInfo', 'interruptionPeriod', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Coverage Period</option>
                    <option value="3-months">3 Months</option>
                    <option value="6-months">6 Months</option>
                    <option value="12-months">12 Months</option>
                    <option value="18-months">18 Months</option>
                    <option value="24-months">24 Months</option>
                  </select>
                  {getFieldError('interruptionPeriod') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('interruptionPeriod')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Coverage */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Coverage Options</h4>
          
          <div className="space-y-3">
            {[
              { value: 'glass-breakage', label: 'Glass Breakage Coverage' },
              { value: 'electronic-equipment', label: 'Electronic Equipment All Risks' },
              { value: 'theft-by-employees', label: 'Theft by Employees (Fidelity)' },
              { value: 'goods-in-transit', label: 'Goods in Transit' },
              { value: 'contract-works', label: 'Contract Works' },
              { value: 'portable-equipment', label: 'Portable Equipment (Laptops, Tools)' },
              { value: 'legal-expenses', label: 'Legal Expenses' },
              { value: 'loss-of-rent', label: 'Loss of Rent (if property is let)' }
            ].map((coverage) => (
              <label key={coverage.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={coverage.value}
                  checked={(formData.insuranceInfo.additionalCoverages || []).includes(coverage.value)}
                  onChange={(e) => {
                    const currentCoverages = formData.insuranceInfo.additionalCoverages || [];
                    const updatedCoverages = e.target.checked
                      ? [...currentCoverages, coverage.value]
                      : currentCoverages.filter((c: string) => c !== coverage.value);
                    updateFormData('insuranceInfo', 'additionalCoverages', updatedCoverages);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{coverage.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any high-value items that require individual coverage?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighValueItems"
                value="no"
                checked={formData.insuranceInfo.hasHighValueItems === 'no'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasHighValueItems', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No high-value items</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasHighValueItems"
                value="yes"
                checked={formData.insuranceInfo.hasHighValueItems === 'yes'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasHighValueItems', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, I have high-value items</span>
            </label>
          </div>
        </div>

        {/* High Value Items Details - shown when "Yes" is selected */}
        {formData.insuranceInfo.hasHighValueItems === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe the high-value items and their approximate values *
            </label>
            <textarea
              placeholder="e.g., Specialized machinery worth R500,000, Art pieces worth R50,000, etc."
              value={formData.insuranceInfo.highValueItemsDetails || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'highValueItemsDetails', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('highValueItemsDetails') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('highValueItemsDetails')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  // Property Usage Step (for Commercial Property Insurance)
  const renderPropertyUsageStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Property Usage Details</h3>
      
      <div className="space-y-4">
        {/* Primary Business Activity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Business Activity *
          </label>
          <select
            value={formData.insuranceInfo.primaryBusinessActivity || ''}
            onChange={(e) => updateFormData('insuranceInfo', 'primaryBusinessActivity', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Primary Activity</option>
            <option value="retail-general">Retail - General Merchandise</option>
            <option value="retail-food">Retail - Food & Beverages</option>
            <option value="retail-clothing">Retail - Clothing & Accessories</option>
            <option value="office-professional">Office - Professional Services</option>
            <option value="office-financial">Office - Financial Services</option>
            <option value="office-technology">Office - Technology & IT</option>
            <option value="warehouse-storage">Warehouse - Storage & Distribution</option>
            <option value="warehouse-manufacturing">Warehouse - Manufacturing</option>
            <option value="industrial-light">Industrial - Light Manufacturing</option>
            <option value="industrial-heavy">Industrial - Heavy Manufacturing</option>
            <option value="hospitality-restaurant">Hospitality - Restaurant</option>
            <option value="hospitality-accommodation">Hospitality - Accommodation</option>
            <option value="medical-clinic">Medical - Clinic/Practice</option>
            <option value="medical-hospital">Medical - Hospital/Care Facility</option>
            <option value="education">Education & Training</option>
            <option value="automotive">Automotive Services</option>
            <option value="construction-office">Construction - Office/Admin</option>
            <option value="other">Other (specify below)</option>
          </select>
          {getFieldError('primaryBusinessActivity') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('primaryBusinessActivity')}
            </p>
          )}
        </div>

        {/* Other Business Activity - shown when "Other" is selected */}
        {formData.insuranceInfo.primaryBusinessActivity === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please specify business activity *
            </label>
            <input
              type="text"
              placeholder="Describe your primary business activity"
              value={formData.insuranceInfo.otherBusinessActivity || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'otherBusinessActivity', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('otherBusinessActivity') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('otherBusinessActivity')}
              </p>
            )}
          </div>
        )}

        {/* Occupancy Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Occupancy *
            </label>
            <select
              value={formData.insuranceInfo.propertyOccupancy || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'propertyOccupancy', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Occupancy Type</option>
              <option value="owner-occupied">Owner Occupied</option>
              <option value="tenant-occupied">Tenant Occupied</option>
              <option value="mixed-occupancy">Mixed (Owner & Tenant)</option>
              <option value="vacant">Currently Vacant</option>
            </select>
            {getFieldError('propertyOccupancy') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('propertyOccupancy')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operating Hours per Day *
            </label>
            <select
              value={formData.insuranceInfo.operatingHours || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'operatingHours', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Operating Hours</option>
              <option value="8-hours">Up to 8 hours</option>
              <option value="12-hours">9-12 hours</option>
              <option value="16-hours">13-16 hours</option>
              <option value="24-hours">24 hours</option>
              <option value="seasonal">Seasonal Operation</option>
            </select>
            {getFieldError('operatingHours') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('operatingHours')}
              </p>
            )}
          </div>
        </div>

        {/* Floor Area and Staff Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Floor Area (sqm) *
            </label>
            <input
              type="number"
              placeholder="e.g., 500"
              value={formData.insuranceInfo.floorArea || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'floorArea', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('floorArea') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('floorArea')}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Staff on Premises *
            </label>
            <select
              value={formData.insuranceInfo.staffCount || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'staffCount', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Staff Count</option>
              <option value="1-5">1-5 staff members</option>
              <option value="6-20">6-20 staff members</option>
              <option value="21-50">21-50 staff members</option>
              <option value="51-100">51-100 staff members</option>
              <option value="100+">More than 100 staff</option>
            </select>
            {getFieldError('staffCount') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('staffCount')}
              </p>
            )}
          </div>
        </div>

        {/* Security and Safety Measures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Measures in Place *
          </label>
          <div className="space-y-2">
            {[
              { value: 'alarm-system', label: 'Burglar Alarm System' },
              { value: 'security-guards', label: 'Security Guards' },
              { value: 'cctv', label: 'CCTV Surveillance' },
              { value: 'access-control', label: 'Access Control System' },
              { value: 'perimeter-fencing', label: 'Perimeter Fencing/Security' },
              { value: 'fire-detection', label: 'Fire Detection System' },
              { value: 'fire-suppression', label: 'Fire Suppression System' },
              { value: 'emergency-lighting', label: 'Emergency Lighting' },
              { value: 'none', label: 'No special security measures' }
            ].map((measure) => (
              <label key={measure.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={measure.value}
                  checked={(formData.insuranceInfo.securityMeasures || []).includes(measure.value)}
                  onChange={(e) => {
                    const currentMeasures = formData.insuranceInfo.securityMeasures || [];
                    const updatedMeasures = e.target.checked
                      ? [...currentMeasures, measure.value]
                      : currentMeasures.filter((m: string) => m !== measure.value);
                    updateFormData('insuranceInfo', 'securityMeasures', updatedMeasures);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{measure.label}</span>
              </label>
            ))}
          </div>
          {getFieldError('securityMeasures') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('securityMeasures')}
            </p>
          )}
        </div>

        {/* Special Risks or Hazards */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are there any special risks or hazards associated with your business operations?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasSpecialRisks"
                value="no"
                checked={formData.insuranceInfo.hasSpecialRisks === 'no'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasSpecialRisks', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No special risks</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasSpecialRisks"
                value="yes"
                checked={formData.insuranceInfo.hasSpecialRisks === 'yes'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasSpecialRisks', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, there are special risks</span>
            </label>
          </div>
        </div>

        {/* Special Risks Details - shown when "Yes" is selected */}
        {formData.insuranceInfo.hasSpecialRisks === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please describe the special risks or hazards *
            </label>
            <textarea
              placeholder="Describe any special risks, hazardous materials, high-risk activities, etc."
              value={formData.insuranceInfo.specialRisksDescription || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'specialRisksDescription', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('specialRisksDescription') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('specialRisksDescription')}
              </p>
            )}
          </div>
        )}

        {/* Previous Claims */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have you had any property insurance claims in the last 5 years?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasPropertyClaims"
                value="no"
                checked={formData.insuranceInfo.hasPropertyClaims === 'no'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasPropertyClaims', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">No claims in the last 5 years</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasPropertyClaims"
                value="yes"
                checked={formData.insuranceInfo.hasPropertyClaims === 'yes'}
                onChange={(e) => updateFormData('insuranceInfo', 'hasPropertyClaims', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, I have had claims</span>
            </label>
          </div>
        </div>

        {/* Property Claims Details - shown when "Yes" is selected */}
        {formData.insuranceInfo.hasPropertyClaims === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please provide details of previous claims *
            </label>
            <textarea
              placeholder="Include dates, causes, and approximate claim amounts"
              value={formData.insuranceInfo.propertyClaimsDetails || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'propertyClaimsDetails', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('propertyClaimsDetails') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('propertyClaimsDetails')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  // Fleet Details Step (for Transport Insurance)
  const renderFleetDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Fleet Information</h3>
      
      <div className="space-y-4">
        {/* Fleet Size */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Fleet Size & Composition</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Number of Vehicles *
              </label>
              <select
                value={formData.insuranceInfo.totalVehicles || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'totalVehicles', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Fleet Size</option>
                <option value="1-5">1-5 vehicles</option>
                <option value="6-10">6-10 vehicles</option>
                <option value="11-20">11-20 vehicles</option>
                <option value="21-50">21-50 vehicles</option>
                <option value="51-100">51-100 vehicles</option>
                <option value="100+">More than 100 vehicles</option>
              </select>
              {getFieldError('totalVehicles') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('totalVehicles')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fleet Ownership Status *
              </label>
              <select
                value={formData.insuranceInfo.fleetOwnership || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'fleetOwnership', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Ownership</option>
                <option value="owned">Fully Owned</option>
                <option value="leased">Fully Leased</option>
                <option value="mixed">Mixed (Owned & Leased)</option>
                <option value="financed">Financed</option>
              </select>
              {getFieldError('fleetOwnership') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('fleetOwnership')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Types in Fleet</h4>
          
          <div className="space-y-3">
            {[
              { value: 'light-commercial', label: 'Light Commercial Vehicles (Bakkies, Panel Vans)' },
              { value: 'heavy-trucks', label: 'Heavy Trucks (Over 3.5 tons)' },
              { value: 'articulated-trucks', label: 'Articulated Trucks/Semi-trailers' },
              { value: 'buses-coaches', label: 'Buses & Coaches' },
              { value: 'taxis-minibuses', label: 'Taxis & Minibuses' },
              { value: 'construction-vehicles', label: 'Construction/Mining Vehicles' },
              { value: 'specialized-vehicles', label: 'Specialized Vehicles (Cranes, Tow Trucks)' },
              { value: 'refrigerated-trucks', label: 'Refrigerated Trucks' },
              { value: 'tanker-trucks', label: 'Tanker Trucks' },
              { value: 'delivery-vans', label: 'Delivery Vans' },
              { value: 'passenger-cars', label: 'Passenger Cars (Company Fleet)' }
            ].map((vehicleType) => (
              <label key={vehicleType.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={vehicleType.value}
                  checked={(formData.insuranceInfo.vehicleTypes || []).includes(vehicleType.value)}
                  onChange={(e) => {
                    const currentTypes = formData.insuranceInfo.vehicleTypes || [];
                    const updatedTypes = e.target.checked
                      ? [...currentTypes, vehicleType.value]
                      : currentTypes.filter((t: string) => t !== vehicleType.value);
                    updateFormData('insuranceInfo', 'vehicleTypes', updatedTypes);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{vehicleType.label}</span>
              </label>
            ))}
          </div>
          {getFieldError('vehicleTypes') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('vehicleTypes')}
            </p>
          )}
        </div>

        {/* Fleet Value */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Fleet Value & Age</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Fleet Value *
              </label>
              <select
                value={formData.insuranceInfo.totalFleetValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'totalFleetValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Fleet Value</option>
                <option value="0-500000">R0 - R500,000</option>
                <option value="500000-1000000">R500,000 - R1,000,000</option>
                <option value="1000000-2500000">R1,000,000 - R2,500,000</option>
                <option value="2500000-5000000">R2,500,000 - R5,000,000</option>
                <option value="5000000-10000000">R5,000,000 - R10,000,000</option>
                <option value="10000000-25000000">R10,000,000 - R25,000,000</option>
                <option value="25000000+">R25,000,000+</option>
              </select>
              {getFieldError('totalFleetValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('totalFleetValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Fleet Age
              </label>
              <select
                value={formData.insuranceInfo.averageFleetAge || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'averageFleetAge', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Average Age</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="15+">More than 15 years</option>
                <option value="mixed">Mixed ages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Number of Drivers *
              </label>
              <select
                value={formData.insuranceInfo.totalDrivers || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'totalDrivers', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Number of Drivers</option>
                <option value="1-5">1-5 drivers</option>
                <option value="6-10">6-10 drivers</option>
                <option value="11-20">11-20 drivers</option>
                <option value="21-50">21-50 drivers</option>
                <option value="51-100">51-100 drivers</option>
                <option value="100+">More than 100 drivers</option>
              </select>
              {getFieldError('totalDrivers') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('totalDrivers')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Age Profile
              </label>
              <select
                value={formData.insuranceInfo.driverAgeProfile || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'driverAgeProfile', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Age Profile</option>
                <option value="mostly-under-30">Mostly under 30</option>
                <option value="mostly-30-50">Mostly 30-50</option>
                <option value="mostly-over-50">Mostly over 50</option>
                <option value="mixed-ages">Mixed ages</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Driver Experience Required
            </label>
            <select
              value={formData.insuranceInfo.minDriverExperience || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'minDriverExperience', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Experience Requirement</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years minimum</option>
              <option value="5-10">5-10 years minimum</option>
              <option value="10+">10+ years minimum</option>
              <option value="varies">Varies by vehicle type</option>
            </select>
          </div>
        </div>

        {/* Security & Tracking */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Security & Tracking Systems</h4>
          
          <div className="space-y-3">
            {[
              { value: 'gps-tracking', label: 'GPS Tracking Systems' },
              { value: 'immobilizers', label: 'Engine Immobilizers' },
              { value: 'alarm-systems', label: 'Alarm Systems' },
              { value: 'central-locking', label: 'Central Locking Systems' },
              { value: 'security-guards', label: 'Security Guards at Depot' },
              { value: 'secure-parking', label: 'Secure Parking Facilities' },
              { value: 'cctv-monitoring', label: 'CCTV Monitoring' },
              { value: 'driver-monitoring', label: 'Driver Behavior Monitoring Systems' },
              { value: 'panic-buttons', label: 'Emergency/Panic Buttons' },
              { value: 'none', label: 'No special security measures' }
            ].map((security) => (
              <label key={security.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={security.value}
                  checked={(formData.insuranceInfo.securitySystems || []).includes(security.value)}
                  onChange={(e) => {
                    const currentSystems = formData.insuranceInfo.securitySystems || [];
                    const updatedSystems = e.target.checked
                      ? [...currentSystems, security.value]
                      : currentSystems.filter((s: string) => s !== security.value);
                    updateFormData('insuranceInfo', 'securitySystems', updatedSystems);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{security.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Transport Operations Step (for Transport Insurance)
  const renderTransportOperationsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Transport Operations Details</h3>
      
      <div className="space-y-4">
        {/* Business Operations */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Type of Transport Operations</h4>
          
          <div className="space-y-3">
            {[
              { value: 'goods-transport', label: 'Goods Transportation/Logistics' },
              { value: 'passenger-transport', label: 'Passenger Transportation' },
              { value: 'construction-transport', label: 'Construction/Mining Transport' },
              { value: 'hazardous-materials', label: 'Hazardous Materials Transport' },
              { value: 'refrigerated-transport', label: 'Refrigerated/Cold Chain Transport' },
              { value: 'courier-delivery', label: 'Courier/Delivery Services' },
              { value: 'taxi-services', label: 'Taxi/Ride Services' },
              { value: 'bus-services', label: 'Bus/Coach Services' },
              { value: 'rental-services', label: 'Vehicle Rental Services' },
              { value: 'emergency-services', label: 'Emergency/Medical Transport' },
              { value: 'specialized-transport', label: 'Specialized Equipment Transport' },
              { value: 'mixed-operations', label: 'Mixed Operations' }
            ].map((operation) => (
              <label key={operation.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={operation.value}
                  checked={(formData.insuranceInfo.operationTypes || []).includes(operation.value)}
                  onChange={(e) => {
                    const currentOperations = formData.insuranceInfo.operationTypes || [];
                    const updatedOperations = e.target.checked
                      ? [...currentOperations, operation.value]
                      : currentOperations.filter((o: string) => o !== operation.value);
                    updateFormData('insuranceInfo', 'operationTypes', updatedOperations);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{operation.label}</span>
              </label>
            ))}
          </div>
          {getFieldError('operationTypes') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getFieldError('operationTypes')}
            </p>
          )}
        </div>

        {/* Operating Area */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operating Area & Routes</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Operating Area *
              </label>
              <select
                value={formData.insuranceInfo.operatingArea || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'operatingArea', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Area</option>
                <option value="local-municipal">Local (Within Municipal Area)</option>
                <option value="provincial">Provincial (Within Province)</option>
                <option value="national">National (Across Provinces)</option>
                <option value="regional-sadc">Regional (SADC Countries)</option>
                <option value="international">International</option>
                <option value="mixed">Mixed Areas</option>
              </select>
              {getFieldError('operatingArea') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('operatingArea')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route Types
              </label>
              <select
                value={formData.insuranceInfo.routeTypes || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'routeTypes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Route Types</option>
                <option value="urban-only">Urban/City Routes Only</option>
                <option value="highways-only">Highways Only</option>
                <option value="rural-routes">Rural/Remote Routes</option>
                <option value="mixed-routes">Mixed Route Types</option>
                <option value="fixed-routes">Fixed Routes/Scheduled</option>
                <option value="variable-routes">Variable/On-demand Routes</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              High-Risk Routes or Areas
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasHighRiskRoutes"
                  value="no"
                  checked={formData.insuranceInfo.hasHighRiskRoutes === 'no'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasHighRiskRoutes', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No high-risk routes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasHighRiskRoutes"
                  value="yes"
                  checked={formData.insuranceInfo.hasHighRiskRoutes === 'yes'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasHighRiskRoutes', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes, we operate in high-risk areas</span>
              </label>
            </div>
          </div>

          {/* High Risk Routes Details */}
          {formData.insuranceInfo.hasHighRiskRoutes === 'yes' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe the high-risk routes or areas *
              </label>
              <textarea
                placeholder="e.g., Mining areas, remote locations, high-crime areas, etc."
                value={formData.insuranceInfo.highRiskRoutesDetails || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'highRiskRoutesDetails', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('highRiskRoutesDetails') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('highRiskRoutesDetails')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Operating Schedule */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operating Schedule</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Operating Hours *
              </label>
              <select
                value={formData.insuranceInfo.dailyOperatingHours || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'dailyOperatingHours', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Hours</option>
                <option value="8-hours">Up to 8 hours/day</option>
                <option value="12-hours">9-12 hours/day</option>
                <option value="16-hours">13-16 hours/day</option>
                <option value="24-hours">24 hours/day</option>
                <option value="varies">Varies by vehicle/driver</option>
              </select>
              {getFieldError('dailyOperatingHours') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('dailyOperatingHours')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Operating Days *
              </label>
              <select
                value={formData.insuranceInfo.weeklyOperatingDays || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'weeklyOperatingDays', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Days</option>
                <option value="5-days">Monday to Friday (5 days)</option>
                <option value="6-days">Monday to Saturday (6 days)</option>
                <option value="7-days">7 days a week</option>
                <option value="flexible">Flexible schedule</option>
              </select>
              {getFieldError('weeklyOperatingDays') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('weeklyOperatingDays')}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Night Operations (10 PM - 6 AM)
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasNightOperations"
                  value="no"
                  checked={formData.insuranceInfo.hasNightOperations === 'no'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasNightOperations', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No night operations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasNightOperations"
                  value="occasional"
                  checked={formData.insuranceInfo.hasNightOperations === 'occasional'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasNightOperations', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Occasional night operations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasNightOperations"
                  value="regular"
                  checked={formData.insuranceInfo.hasNightOperations === 'regular'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasNightOperations', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Regular night operations</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cargo & Load Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Cargo & Load Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Load Value per Trip *
              </label>
              <select
                value={formData.insuranceInfo.maxLoadValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'maxLoadValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Load Value</option>
                <option value="0-50000">R0 - R50,000</option>
                <option value="50000-100000">R50,000 - R100,000</option>
                <option value="100000-250000">R100,000 - R250,000</option>
                <option value="250000-500000">R250,000 - R500,000</option>
                <option value="500000-1000000">R500,000 - R1,000,000</option>
                <option value="1000000-2500000">R1,000,000 - R2,500,000</option>
                <option value="2500000+">R2,500,000+</option>
                <option value="not-applicable">Not Applicable (Passenger Transport)</option>
              </select>
              {getFieldError('maxLoadValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('maxLoadValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo Security Measures
              </label>
              <select
                value={formData.insuranceInfo.cargoSecurity || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'cargoSecurity', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Security Level</option>
                <option value="basic">Basic Security (Standard locks)</option>
                <option value="enhanced">Enhanced Security (Multi-point locking)</option>
                <option value="high-security">High Security (Armed escort, tracking)</option>
                <option value="specialized">Specialized Security (Armoured vehicles)</option>
                <option value="not-applicable">Not Applicable</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types of Cargo/Goods Transported
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {[
                { value: 'general-freight', label: 'General Freight/Dry Goods' },
                { value: 'food-beverages', label: 'Food & Beverages' },
                { value: 'pharmaceuticals', label: 'Pharmaceuticals/Medical Supplies' },
                { value: 'electronics', label: 'Electronics/IT Equipment' },
                { value: 'automotive-parts', label: 'Automotive Parts' },
                { value: 'construction-materials', label: 'Construction Materials' },
                { value: 'chemicals', label: 'Chemicals/Hazardous Materials' },
                { value: 'fuel-petroleum', label: 'Fuel/Petroleum Products' },
                { value: 'livestock', label: 'Livestock/Animals' },
                { value: 'machinery', label: 'Heavy Machinery/Equipment' },
                { value: 'textiles', label: 'Textiles/Clothing' },
                { value: 'agricultural', label: 'Agricultural Products' },
                { value: 'high-value', label: 'High-Value/Luxury Goods' },
                { value: 'mixed-cargo', label: 'Mixed Cargo Types' }
              ].map((cargo) => (
                <label key={cargo.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={cargo.value}
                    checked={(formData.insuranceInfo.cargoTypes || []).includes(cargo.value)}
                    onChange={(e) => {
                      const currentCargo = formData.insuranceInfo.cargoTypes || [];
                      const updatedCargo = e.target.checked
                        ? [...currentCargo, cargo.value]
                        : currentCargo.filter((c: string) => c !== cargo.value);
                      updateFormData('insuranceInfo', 'cargoTypes', updatedCargo);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cargo.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Claims History */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Claims History & Experience</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have you had any transport/fleet insurance claims in the last 5 years?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasTransportClaims"
                  value="no"
                  checked={formData.insuranceInfo.hasTransportClaims === 'no'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasTransportClaims', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">No claims in the last 5 years</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasTransportClaims"
                  value="yes"
                  checked={formData.insuranceInfo.hasTransportClaims === 'yes'}
                  onChange={(e) => updateFormData('insuranceInfo', 'hasTransportClaims', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Yes, I have had claims</span>
              </label>
            </div>
          </div>

          {/* Claims Details */}
          {formData.insuranceInfo.hasTransportClaims === 'yes' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide details of transport claims *
              </label>
              <textarea
                placeholder="Include dates, types of claims (accidents, theft, cargo damage), and approximate amounts"
                value={formData.insuranceInfo.transportClaimsDetails || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'transportClaimsDetails', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('transportClaimsDetails') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('transportClaimsDetails')}
                </p>
              )}
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Transport Business *
              </label>
              <select
                value={formData.insuranceInfo.yearsInBusiness || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'yearsInBusiness', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Experience</option>
                <option value="less-than-1">Less than 1 year</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-20">11-20 years</option>
                <option value="20+">More than 20 years</option>
              </select>
              {getFieldError('yearsInBusiness') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('yearsInBusiness')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Record/Accreditations
              </label>
              <select
                value={formData.insuranceInfo.safetyRecord || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'safetyRecord', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Safety Level</option>
                <option value="excellent">Excellent (No incidents)</option>
                <option value="good">Good (Minor incidents only)</option>
                <option value="average">Average industry standard</option>
                <option value="below-average">Below average</option>
                <option value="new-operator">New operator</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // Scheme Details Step (for Body Corporate Insurance)
  const renderSchemeDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sectional Title Scheme Details</h3>
      
      <div className="space-y-4">
        {/* Basic Scheme Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Scheme Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheme Name *
              </label>
              <input
                type="text"
                placeholder="Enter scheme name"
                value={formData.insuranceInfo.schemeName || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'schemeName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('schemeName') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('schemeName')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sectional Title Number
              </label>
              <input
                type="text"
                placeholder="e.g., SS123/2020"
                value={formData.insuranceInfo.sectionalTitleNumber || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'sectionalTitleNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built/Established *
              </label>
              <select
                value={formData.insuranceInfo.yearBuilt || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'yearBuilt', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Year Range</option>
                <option value="2020-2025">2020-2025 (Very New)</option>
                <option value="2010-2019">2010-2019 (New)</option>
                <option value="2000-2009">2000-2009 (Modern)</option>
                <option value="1990-1999">1990-1999 (Established)</option>
                <option value="1980-1989">1980-1989 (Mature)</option>
                <option value="1970-1979">1970-1979 (Older)</option>
                <option value="pre-1970">Before 1970 (Historic)</option>
              </select>
              {getFieldError('yearBuilt') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('yearBuilt')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheme Status *
              </label>
              <select
                value={formData.insuranceInfo.schemeStatus || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'schemeStatus', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="established">Fully Established</option>
                <option value="new-development">New Development</option>
                <option value="under-construction">Under Construction</option>
                <option value="renovation">Under Major Renovation</option>
                <option value="in-liquidation">In Liquidation</option>
              </select>
              {getFieldError('schemeStatus') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('schemeStatus')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scheme Size & Structure */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Scheme Size & Structure</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Number of Units *
              </label>
              <select
                value={formData.insuranceInfo.totalUnits || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'totalUnits', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Number of Units</option>
                <option value="1-10">1-10 units</option>
                <option value="11-25">11-25 units</option>
                <option value="26-50">26-50 units</option>
                <option value="51-100">51-100 units</option>
                <option value="101-200">101-200 units</option>
                <option value="201-500">201-500 units</option>
                <option value="500+">More than 500 units</option>
              </select>
              {getFieldError('totalUnits') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('totalUnits')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Buildings/Blocks *
              </label>
              <select
                value={formData.insuranceInfo.numberOfBuildings || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'numberOfBuildings', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Number of Buildings</option>
                <option value="1">1 building</option>
                <option value="2-3">2-3 buildings</option>
                <option value="4-6">4-6 buildings</option>
                <option value="7-10">7-10 buildings</option>
                <option value="11-20">11-20 buildings</option>
                <option value="20+">More than 20 buildings</option>
              </select>
              {getFieldError('numberOfBuildings') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('numberOfBuildings')}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Storeys *
              </label>
              <select
                value={formData.insuranceInfo.numberOfStoreys || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'numberOfStoreys', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Number of Storeys</option>
                <option value="1-2">1-2 storeys</option>
                <option value="3-4">3-4 storeys</option>
                <option value="5-10">5-10 storeys</option>
                <option value="11-20">11-20 storeys</option>
                <option value="21-30">21-30 storeys</option>
                <option value="30+">More than 30 storeys</option>
              </select>
              {getFieldError('numberOfStoreys') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('numberOfStoreys')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Construction Type *
              </label>
              <select
                value={formData.insuranceInfo.constructionType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'constructionType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Construction Type</option>
                <option value="brick-concrete">Brick & Concrete</option>
                <option value="steel-concrete">Steel & Concrete</option>
                <option value="double-brick">Double Brick</option>
                <option value="face-brick">Face Brick</option>
                <option value="timber-frame">Timber Frame</option>
                <option value="steel-frame">Steel Frame</option>
                <option value="mixed-construction">Mixed Construction</option>
                <option value="other">Other (specify)</option>
              </select>
              {getFieldError('constructionType') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('constructionType')}
                </p>
              )}
            </div>
          </div>
          
          {/* Other Construction Type - shown when "Other" is selected */}
          {formData.insuranceInfo.constructionType === 'other' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify construction type *
              </label>
              <input
                type="text"
                placeholder="Describe the construction type"
                value={formData.insuranceInfo.otherConstructionType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'otherConstructionType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('otherConstructionType') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('otherConstructionType')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Unit Types & Configuration */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Unit Types & Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types of Units in Scheme *
            </label>
            <div className="space-y-3">
              {[
                { value: 'residential-apartments', label: 'Residential Apartments' },
                { value: 'residential-townhouses', label: 'Residential Townhouses' },
                { value: 'residential-penthouses', label: 'Residential Penthouses' },
                { value: 'commercial-retail', label: 'Commercial/Retail Units' },
                { value: 'commercial-offices', label: 'Commercial Offices' },
                { value: 'mixed-use', label: 'Mixed Use Units' },
                { value: 'parking-garages', label: 'Parking Garages/Bays' },
                { value: 'storage-units', label: 'Storage Units' },
                { value: 'other-units', label: 'Other Unit Types' }
              ].map((unitType) => (
                <label key={unitType.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={unitType.value}
                    checked={(formData.insuranceInfo.unitTypes || []).includes(unitType.value)}
                    onChange={(e) => {
                      const currentTypes = formData.insuranceInfo.unitTypes || [];
                      const updatedTypes = e.target.checked
                        ? [...currentTypes, unitType.value]
                        : currentTypes.filter((t: string) => t !== unitType.value);
                      updateFormData('insuranceInfo', 'unitTypes', updatedTypes);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{unitType.label}</span>
                </label>
              ))}
            </div>
            {getFieldError('unitTypes') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('unitTypes')}
              </p>
            )}
          </div>
        </div>

        {/* Management & Administration */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Management & Administration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Management Type *
              </label>
              <select
                value={formData.insuranceInfo.managementType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'managementType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Management Type</option>
                <option value="professional-managing-agent">Professional Managing Agent</option>
                <option value="self-managed">Self-Managed by Trustees</option>
                <option value="property-management-company">Property Management Company</option>
                <option value="caretaker-managed">Caretaker Managed</option>
                <option value="mixed-management">Mixed Management</option>
              </select>
              {getFieldError('managementType') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('managementType')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Managing Agent/Company Name
              </label>
              <input
                type="text"
                placeholder="Enter managing agent name (if applicable)"
                value={formData.insuranceInfo.managingAgentName || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'managingAgentName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reserve Fund Status *
              </label>
              <select
                value={formData.insuranceInfo.reserveFundStatus || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'reserveFundStatus', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Reserve Fund Status</option>
                <option value="well-funded">Well Funded (&gt;12 months expenses)</option>
                <option value="adequately-funded">Adequately Funded (6-12 months)</option>
                <option value="marginally-funded">Marginally Funded (3-6 months)</option>
                <option value="poorly-funded">Poorly Funded (&lt;3 months)</option>
                <option value="no-reserve-fund">No Reserve Fund</option>
                <option value="unknown">Unknown</option>
              </select>
              {getFieldError('reserveFundStatus') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('reserveFundStatus')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Levy Collection Rate
              </label>
              <select
                value={formData.insuranceInfo.levyCollectionRate || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'levyCollectionRate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Collection Rate</option>
                <option value="excellent">Excellent (&gt;95%)</option>
                <option value="good">Good (85-95%)</option>
                <option value="average">Average (70-85%)</option>
                <option value="poor">Poor (&lt;70%)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Environment */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Location & Environment</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type *
              </label>
              <select
                value={formData.insuranceInfo.locationType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'locationType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Location Type</option>
                <option value="city-center">City Center</option>
                <option value="suburban-residential">Suburban Residential</option>
                <option value="coastal-beachfront">Coastal/Beachfront</option>
                <option value="golf-estate">Golf Estate</option>
                <option value="security-estate">Security Estate</option>
                <option value="industrial-area">Near Industrial Area</option>
                <option value="rural-suburban">Rural/Semi-Rural</option>
                <option value="mixed-commercial">Mixed Commercial Area</option>
              </select>
              {getFieldError('locationType') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('locationType')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance from Fire Station
              </label>
              <select
                value={formData.insuranceInfo.distanceFromFireStation || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'distanceFromFireStation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Distance</option>
                <option value="less-than-2km">Less than 2km</option>
                <option value="2-5km">2-5km</option>
                <option value="5-10km">5-10km</option>
                <option value="10-20km">10-20km</option>
                <option value="more-than-20km">More than 20km</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // Common Areas Step (for Body Corporate Insurance)
  const renderCommonAreasStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Common Areas & Facilities</h3>
      
      <div className="space-y-4">
        {/* Buildings & Structures */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Buildings & Structures</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Common Area Buildings & Structures *
            </label>
            <div className="space-y-3">
              {[
                { value: 'entrance-lobby', label: 'Entrance Lobby/Reception Area' },
                { value: 'clubhouse', label: 'Clubhouse/Community Hall' },
                { value: 'caretaker-office', label: 'Caretaker Office/Security Office' },
                { value: 'storage-rooms', label: 'Common Storage Rooms' },
                { value: 'utility-rooms', label: 'Utility/Plant Rooms' },
                { value: 'laundry-facilities', label: 'Common Laundry Facilities' },
                { value: 'garbage-rooms', label: 'Garbage/Refuse Rooms' },
                { value: 'generator-room', label: 'Generator Room' },
                { value: 'pump-house', label: 'Pump House/Water Storage' },
                { value: 'guard-house', label: 'Guard House/Gate House' },
                { value: 'covered-parking', label: 'Covered Parking Areas' },
                { value: 'open-parking', label: 'Open Parking Areas' }
              ].map((structure) => (
                <label key={structure.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={structure.value}
                    checked={(formData.insuranceInfo.commonAreaStructures || []).includes(structure.value)}
                    onChange={(e) => {
                      const currentStructures = formData.insuranceInfo.commonAreaStructures || [];
                      const updatedStructures = e.target.checked
                        ? [...currentStructures, structure.value]
                        : currentStructures.filter((s: string) => s !== structure.value);
                      updateFormData('insuranceInfo', 'commonAreaStructures', updatedStructures);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{structure.label}</span>
                </label>
              ))}
            </div>
            {getFieldError('commonAreaStructures') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('commonAreaStructures')}
              </p>
            )}
          </div>
        </div>

        {/* Recreational Facilities */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recreational Facilities</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recreational & Leisure Facilities
            </label>
            <div className="space-y-3">
              {[
                { value: 'swimming-pool', label: 'Swimming Pool (Indoor/Outdoor)' },
                { value: 'spa-jacuzzi', label: 'Spa/Jacuzzi/Hot Tub' },
                { value: 'sauna-steam', label: 'Sauna/Steam Room' },
                { value: 'gym-fitness', label: 'Gym/Fitness Center' },
                { value: 'tennis-court', label: 'Tennis Court' },
                { value: 'squash-court', label: 'Squash Court' },
                { value: 'basketball-court', label: 'Basketball Court' },
                { value: 'playground', label: 'Children\'s Playground' },
                { value: 'braai-area', label: 'Braai/BBQ Area' },
                { value: 'entertainment-area', label: 'Entertainment Area' },
                { value: 'roof-garden', label: 'Roof Garden/Terrace' },
                { value: 'walking-trails', label: 'Walking Trails/Paths' }
              ].map((facility) => (
                <label key={facility.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={facility.value}
                    checked={(formData.insuranceInfo.recreationalFacilities || []).includes(facility.value)}
                    onChange={(e) => {
                      const currentFacilities = formData.insuranceInfo.recreationalFacilities || [];
                      const updatedFacilities = e.target.checked
                        ? [...currentFacilities, facility.value]
                        : currentFacilities.filter((f: string) => f !== facility.value);
                      updateFormData('insuranceInfo', 'recreationalFacilities', updatedFacilities);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{facility.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure & Systems */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure & Systems</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Common Infrastructure & Systems *
            </label>
            <div className="space-y-3">
              {[
                { value: 'elevators-lifts', label: 'Elevators/Passenger Lifts' },
                { value: 'escalators', label: 'Escalators' },
                { value: 'fire-system', label: 'Fire Detection & Suppression System' },
                { value: 'access-control', label: 'Access Control System' },
                { value: 'cctv-security', label: 'CCTV/Security Camera System' },
                { value: 'intercom-system', label: 'Intercom/Communication System' },
                { value: 'electric-fencing', label: 'Electric Fencing' },
                { value: 'automated-gates', label: 'Automated Gates/Barriers' },
                { value: 'generator-backup', label: 'Generator/Backup Power' },
                { value: 'water-pumps', label: 'Water Pumps/Pressure Systems' },
                { value: 'irrigation-system', label: 'Irrigation System' },
                { value: 'solar-panels', label: 'Solar Panels/Renewable Energy' }
              ].map((system) => (
                <label key={system.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={system.value}
                    checked={(formData.insuranceInfo.infrastructureSystems || []).includes(system.value)}
                    onChange={(e) => {
                      const currentSystems = formData.insuranceInfo.infrastructureSystems || [];
                      const updatedSystems = e.target.checked
                        ? [...currentSystems, system.value]
                        : currentSystems.filter((s: string) => s !== system.value);
                      updateFormData('insuranceInfo', 'infrastructureSystems', updatedSystems);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{system.label}</span>
                </label>
              ))}
            </div>
            {getFieldError('infrastructureSystems') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('infrastructureSystems')}
              </p>
            )}
          </div>
        </div>

        {/* Landscaping & Outdoor Areas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Landscaping & Outdoor Areas</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garden/Landscaping Extent *
              </label>
              <select
                value={formData.insuranceInfo.landscapingExtent || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'landscapingExtent', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Landscaping Extent</option>
                <option value="extensive">Extensive Gardens & Landscaping</option>
                <option value="moderate">Moderate Garden Areas</option>
                <option value="minimal">Minimal Landscaping</option>
                <option value="mainly-paved">Mainly Paved Areas</option>
                <option value="no-gardens">No Common Gardens</option>
              </select>
              {getFieldError('landscapingExtent') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('landscapingExtent')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Features
              </label>
              <select
                value={formData.insuranceInfo.waterFeatures || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'waterFeatures', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Water Features</option>
                <option value="none">None</option>
                <option value="decorative-fountain">Decorative Fountain</option>
                <option value="water-garden">Water Garden/Pond</option>
                <option value="stream-waterfall">Stream/Waterfall</option>
                <option value="multiple-features">Multiple Water Features</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outdoor Amenities
            </label>
            <div className="space-y-3">
              {[
                { value: 'outdoor-seating', label: 'Outdoor Seating Areas' },
                { value: 'gazebos-pergolas', label: 'Gazebos/Pergolas' },
                { value: 'outdoor-lighting', label: 'Decorative Outdoor Lighting' },
                { value: 'pathways-walkways', label: 'Paved Pathways/Walkways' },
                { value: 'outdoor-art', label: 'Outdoor Art/Sculptures' },
                { value: 'pet-areas', label: 'Pet Exercise/Relief Areas' }
              ].map((amenity) => (
                <label key={amenity.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={amenity.value}
                    checked={(formData.insuranceInfo.outdoorAmenities || []).includes(amenity.value)}
                    onChange={(e) => {
                      const currentAmenities = formData.insuranceInfo.outdoorAmenities || [];
                      const updatedAmenities = e.target.checked
                        ? [...currentAmenities, amenity.value]
                        : currentAmenities.filter((a: string) => a !== amenity.value);
                      updateFormData('insuranceInfo', 'outdoorAmenities', updatedAmenities);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Security & Access Control</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Level *
              </label>
              <select
                value={formData.insuranceInfo.securityLevel || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'securityLevel', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Security Level</option>
                <option value="high-security">High Security (24/7 Guards + Access Control)</option>
                <option value="moderate-security">Moderate Security (Part-time Guards/CCTV)</option>
                <option value="basic-security">Basic Security (Access Control Only)</option>
                <option value="minimal-security">Minimal Security (Basic Fencing)</option>
                <option value="open-access">Open Access (No Security)</option>
              </select>
              {getFieldError('securityLevel') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('securityLevel')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Control Type
              </label>
              <select
                value={formData.insuranceInfo.accessControlType || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'accessControlType', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Access Control</option>
                <option value="biometric-access">Biometric Access Control</option>
                <option value="card-key-access">Card/Key Fob Access</option>
                <option value="keypad-access">Keypad/Code Access</option>
                <option value="intercom-access">Intercom Access</option>
                <option value="guard-controlled">Guard-Controlled Access</option>
                <option value="open-access">Open Access</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Security Features
            </label>
            <div className="space-y-3">
              {[
                { value: 'perimeter-fencing', label: 'Perimeter Fencing/Walls' },
                { value: 'electric-fencing', label: 'Electric Fencing' },
                { value: 'security-patrol', label: 'Security Patrol Service' },
                { value: 'armed-response', label: 'Armed Response Service' },
                { value: 'visitor-management', label: 'Visitor Management System' },
                { value: 'emergency-panic', label: 'Emergency/Panic Button System' }
              ].map((feature) => (
                <label key={feature.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={feature.value}
                    checked={(formData.insuranceInfo.additionalSecurityFeatures || []).includes(feature.value)}
                    onChange={(e) => {
                      const currentFeatures = formData.insuranceInfo.additionalSecurityFeatures || [];
                      const updatedFeatures = e.target.checked
                        ? [...currentFeatures, feature.value]
                        : currentFeatures.filter((f: string) => f !== feature.value);
                      updateFormData('insuranceInfo', 'additionalSecurityFeatures', updatedFeatures);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Common Area Maintenance */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Common Area Maintenance</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Standard *
              </label>
              <select
                value={formData.insuranceInfo.maintenanceStandard || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'maintenanceStandard', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Maintenance Standard</option>
                <option value="excellent">Excellent (Professional, Regular)</option>
                <option value="good">Good (Regular, Well-Maintained)</option>
                <option value="average">Average (Basic Maintenance)</option>
                <option value="poor">Poor (Deferred Maintenance)</option>
                <option value="very-poor">Very Poor (Significant Issues)</option>
              </select>
              {getFieldError('maintenanceStandard') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('maintenanceStandard')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cleaning Service
              </label>
              <select
                value={formData.insuranceInfo.cleaningService || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'cleaningService', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Cleaning Service</option>
                <option value="daily-professional">Daily Professional Cleaning</option>
                <option value="weekly-professional">Weekly Professional Cleaning</option>
                <option value="monthly-professional">Monthly Professional Cleaning</option>
                <option value="resident-managed">Resident-Managed Cleaning</option>
                <option value="minimal-cleaning">Minimal Cleaning Service</option>
                <option value="no-cleaning">No Cleaning Service</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderProjectDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Project Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.projectName || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('projectName') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Enter project name"
            required
          />
          {hasFieldError('projectName') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('projectName')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Location *
          </label>
          <input
            type="text"
            value={formData.projectLocation || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectLocation: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('projectLocation') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Project address or location"
            required
          />
          {hasFieldError('projectLocation') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('projectLocation')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Value (ZAR) *
          </label>
          <input
            type="number"
            value={formData.contractValue || ''}
            onChange={e => setFormData(fd => ({ ...fd, contractValue: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('contractValue') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Total contract value"
            min="1"
            required
          />
          {hasFieldError('contractValue') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('contractValue')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Duration (months) *
          </label>
          <input
            type="number"
            value={formData.projectDuration || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectDuration: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasFieldError('projectDuration') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Duration in months"
            min="1"
            required
          />
          {hasFieldError('projectDuration') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('projectDuration')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Start Date *
          </label>
          <input
            type="date"
            value={formData.projectStartDate || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectStartDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Completion Date *
          </label>
          <input
            type="date"
            value={formData.projectEndDate || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectEndDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principal/Client Name *
          </label>
          <input
            type="text"
            value={formData.principalName || ''}
            onChange={e => setFormData(fd => ({ ...fd, principalName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Name of client/principal"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            rows={4}
            value={formData.projectDescription || ''}
            onChange={e => setFormData(fd => ({ ...fd, projectDescription: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detailed description of the project scope and nature of work"
            required
          />
        </div>
      </div>
      
      <button
        className="btn btn-primary"
        onClick={handleNext}
        disabled={!formData.projectName || !formData.projectLocation || !formData.contractValue || 
                 !formData.projectDuration || !formData.projectStartDate || !formData.projectEndDate || 
                 !formData.principalName || !formData.projectDescription || loading}
      >
        Continue
      </button>
    </div>
  );

  const renderConstructionTypeStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Construction Type</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type of Construction Work *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Building Construction',
              'Civil Engineering',
              'Road Construction',
              'Bridge Construction',
              'Infrastructure Development',
              'Renovations & Alterations',
              'Industrial Construction',
              'Residential Development',
              'Commercial Development',
              'Mining Construction',
              'Marine Construction',
              'Other (Please specify)'
            ].map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="constructionType"
                  value={type}
                  checked={formData.constructionType === type}
                  onChange={e => setFormData(fd => ({ ...fd, constructionType: e.target.value }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          
          {formData.constructionType === 'Other (Please specify)' && (
            <div className="mt-3">
              <input
                type="text"
                value={formData.constructionTypeOther || ''}
                onChange={e => setFormData(fd => ({ ...fd, constructionTypeOther: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please specify the type of construction"
                required
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Construction Method *
          </label>
          <div className="space-y-2">
            {[
              'Conventional Construction',
              'Prefabricated Construction',
              'Steel Frame Construction',
              'Concrete Construction',
              'Timber Frame Construction',
              'Mixed Construction Methods'
            ].map(method => (
              <label key={method} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="constructionMethod"
                  value={method}
                  checked={formData.constructionMethod === method}
                  onChange={e => setFormData(fd => ({ ...fd, constructionMethod: e.target.value }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Height (meters)
            </label>
            <input
              type="number"
              value={formData.maxHeight || ''}
              onChange={e => setFormData(fd => ({ ...fd, maxHeight: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Maximum construction height"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Depth (meters)
            </label>
            <input
              type="number"
              value={formData.maxDepth || ''}
              onChange={e => setFormData(fd => ({ ...fd, maxDepth: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Maximum excavation/foundation depth"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Special Risks or Hazards (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Working at height',
              'Underground work',
              'Work near water/waterways',
              'Hazardous materials',
              'Heavy machinery operation',
              'Demolition work',
              'Work in congested areas',
              'Environmental sensitive areas',
              'Archaeological sites',
              'Live utilities/services'
            ].map(risk => (
              <label key={risk} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.specialRisks?.includes(risk) || false}
                  onChange={e => {
                    const currentRisks = formData.specialRisks || [];
                    if (e.target.checked) {
                      setFormData(fd => ({ ...fd, specialRisks: [...currentRisks, risk] }));
                    } else {
                      setFormData(fd => ({ ...fd, specialRisks: currentRisks.filter(r => r !== risk) }));
                    }
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">{risk}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Construction Details
          </label>
          <textarea
            rows={3}
            value={formData.additionalConstructionDetails || ''}
            onChange={e => setFormData(fd => ({ ...fd, additionalConstructionDetails: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional details about construction methods, materials, or special considerations"
          />
        </div>
      </div>
      
      <button
        className="btn btn-primary"
        onClick={handleNext}
        disabled={!formData.constructionType || !formData.constructionMethod || loading}
      >
        Continue
      </button>
    </div>
  );
  
  // Asset Details Step (for Aviation & Marine Insurance)
  const renderAssetDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Asset Details</h3>
      
      <div className="space-y-4">
        {/* Asset Type Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Type</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Asset Type *
            </label>
            <select
              value={formData.insuranceInfo.primaryAssetType || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'primaryAssetType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Asset Type</option>
              <optgroup label="Aviation Assets">
                <option value="commercial-aircraft">Commercial Aircraft</option>
                <option value="private-aircraft">Private Aircraft</option>
                <option value="helicopter">Helicopter</option>
                <option value="glider">Glider/Sailplane</option>
                <option value="ultralight">Ultralight Aircraft</option>
                <option value="drone-commercial">Commercial Drone/UAV</option>
                <option value="aircraft-hangar">Aircraft Hangar</option>
                <option value="aviation-equipment">Aviation Equipment</option>
              </optgroup>
              <optgroup label="Marine Assets">
                <option value="yacht">Yacht/Pleasure Craft</option>
                <option value="commercial-vessel">Commercial Vessel</option>
                <option value="fishing-vessel">Fishing Vessel</option>
                <option value="cargo-ship">Cargo Ship</option>
                <option value="speedboat">Speedboat</option>
                <option value="sailboat">Sailboat</option>
                <option value="jet-ski">Jet Ski/Personal Watercraft</option>
                <option value="marina-facilities">Marina Facilities</option>
                <option value="marine-equipment">Marine Equipment</option>
              </optgroup>
            </select>
            {getFieldError('primaryAssetType') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('primaryAssetType')}
              </p>
            )}
          </div>
        </div>

        {/* Asset Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make/Manufacturer *
              </label>
              <input
                type="text"
                placeholder="Enter manufacturer"
                value={formData.insuranceInfo.assetManufacturer || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetManufacturer', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('assetManufacturer') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetManufacturer')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                placeholder="Enter model"
                value={formData.insuranceInfo.assetModel || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetModel', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('assetModel') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetModel')}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built/Manufactured *
              </label>
              <select
                value={formData.insuranceInfo.assetYear || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetYear', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Year</option>
                {Array.from({length: 50}, (_, i) => 2024 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
                <option value="before-1974">Before 1974</option>
              </select>
              {getFieldError('assetYear') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetYear')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration/Serial Number *
              </label>
              <input
                type="text"
                placeholder="Enter registration/serial number"
                value={formData.insuranceInfo.assetRegistration || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetRegistration', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('assetRegistration') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetRegistration')}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Value *
              </label>
              <select
                value={formData.insuranceInfo.assetValue || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetValue', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Asset Value</option>
                <option value="0-100k">R0 - R100,000</option>
                <option value="100k-500k">R100,000 - R500,000</option>
                <option value="500k-1m">R500,000 - R1,000,000</option>
                <option value="1m-5m">R1,000,000 - R5,000,000</option>
                <option value="5m-10m">R5,000,000 - R10,000,000</option>
                <option value="10m-50m">R10,000,000 - R50,000,000</option>
                <option value="50m-plus">R50,000,000+</option>
              </select>
              {getFieldError('assetValue') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetValue')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Condition *
              </label>
              <select
                value={formData.insuranceInfo.assetCondition || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'assetCondition', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Condition</option>
                <option value="excellent">Excellent (Like New)</option>
                <option value="very-good">Very Good</option>
                <option value="good">Good</option>
                <option value="fair">Fair (Minor Issues)</option>
                <option value="poor">Poor (Major Issues)</option>
                <option value="restoration-required">Restoration Required</option>
              </select>
              {getFieldError('assetCondition') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('assetCondition')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Aviation Specific Details */}
        {(formData.insuranceInfo.primaryAssetType?.includes('aircraft') || 
          formData.insuranceInfo.primaryAssetType?.includes('helicopter') || 
          formData.insuranceInfo.primaryAssetType?.includes('glider') || 
          formData.insuranceInfo.primaryAssetType?.includes('ultralight') || 
          formData.insuranceInfo.primaryAssetType?.includes('drone')) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Aviation Specifications</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Type
                </label>
                <select
                  value={formData.insuranceInfo.engineType || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'engineType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Engine Type</option>
                  <option value="piston-single">Single Piston Engine</option>
                  <option value="piston-multi">Multi Piston Engine</option>
                  <option value="turboprop-single">Single Turboprop</option>
                  <option value="turboprop-multi">Multi Turboprop</option>
                  <option value="turbojet">Turbojet</option>
                  <option value="turbofan">Turbofan</option>
                  <option value="electric">Electric Motor</option>
                  <option value="glider-none">None (Glider)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Seating Capacity
                </label>
                <select
                  value={formData.insuranceInfo.seatingCapacity || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'seatingCapacity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Capacity</option>
                  <option value="1-2">1-2 seats</option>
                  <option value="3-4">3-4 seats</option>
                  <option value="5-9">5-9 seats</option>
                  <option value="10-19">10-19 seats</option>
                  <option value="20-50">20-50 seats</option>
                  <option value="51-100">51-100 seats</option>
                  <option value="100-plus">100+ seats</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Take-off Weight (MTOW)
                </label>
                <select
                  value={formData.insuranceInfo.maxTakeoffWeight || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'maxTakeoffWeight', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select MTOW</option>
                  <option value="under-600kg">Under 600kg (ULM)</option>
                  <option value="600kg-1500kg">600kg - 1,500kg</option>
                  <option value="1500kg-5700kg">1,500kg - 5,700kg</option>
                  <option value="5700kg-plus">Over 5,700kg</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Hours (Total Time)
                </label>
                <input
                  type="number"
                  placeholder="Enter total flight hours"
                  value={formData.insuranceInfo.totalFlightHours || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'totalFlightHours', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Marine Specific Details */}
        {(formData.insuranceInfo.primaryAssetType?.includes('yacht') || 
          formData.insuranceInfo.primaryAssetType?.includes('vessel') || 
          formData.insuranceInfo.primaryAssetType?.includes('boat') || 
          formData.insuranceInfo.primaryAssetType?.includes('jet-ski')) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Marine Specifications</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vessel Length
                </label>
                <select
                  value={formData.insuranceInfo.vesselLength || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'vesselLength', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Length</option>
                  <option value="under-5m">Under 5m</option>
                  <option value="5m-10m">5m - 10m</option>
                  <option value="10m-15m">10m - 15m</option>
                  <option value="15m-24m">15m - 24m</option>
                  <option value="24m-35m">24m - 35m</option>
                  <option value="35m-plus">Over 35m</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hull Material
                </label>
                <select
                  value={formData.insuranceInfo.hullMaterial || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'hullMaterial', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Hull Material</option>
                  <option value="fiberglass">Fiberglass/GRP</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="steel">Steel</option>
                  <option value="wood">Wood</option>
                  <option value="carbon-fiber">Carbon Fiber</option>
                  <option value="composite">Composite Materials</option>
                  <option value="inflatable">Inflatable (RIB)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Configuration
                </label>
                <select
                  value={formData.insuranceInfo.engineConfiguration || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'engineConfiguration', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Configuration</option>
                  <option value="outboard-single">Single Outboard</option>
                  <option value="outboard-twin">Twin Outboard</option>
                  <option value="outboard-multiple">Multiple Outboards</option>
                  <option value="inboard-single">Single Inboard</option>
                  <option value="inboard-twin">Twin Inboard</option>
                  <option value="stern-drive">Stern Drive/I-O</option>
                  <option value="jet-drive">Jet Drive</option>
                  <option value="sail-only">Sail Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Speed (knots)
                </label>
                <input
                  type="number"
                  placeholder="Enter max speed in knots"
                  value={formData.insuranceInfo.maxSpeed || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'maxSpeed', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Storage & Location */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage & Location</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Storage Location *
              </label>
              <select
                value={formData.insuranceInfo.storageLocation || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'storageLocation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Storage Location</option>
                <optgroup label="Aviation Storage">
                  <option value="commercial-hangar">Commercial Hangar</option>
                  <option value="private-hangar">Private Hangar</option>
                  <option value="tie-down-covered">Tie-down (Covered)</option>
                  <option value="tie-down-open">Tie-down (Open)</option>
                  <option value="home-garage">Home Garage</option>
                </optgroup>
                <optgroup label="Marine Storage">
                  <option value="marina-berth">Marina Berth</option>
                  <option value="mooring-buoy">Mooring Buoy</option>
                  <option value="dry-storage">Dry Storage Facility</option>
                  <option value="private-dock">Private Dock</option>
                  <option value="boat-yard">Boat Yard</option>
                  <option value="home-driveway">Home Driveway/Garage</option>
                  <option value="trailer-storage">Trailer Storage</option>
                </optgroup>
              </select>
              {getFieldError('storageLocation') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('storageLocation')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Security Level
              </label>
              <select
                value={formData.insuranceInfo.storageSecurityLevel || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'storageSecurityLevel', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Security Level</option>
                <option value="high-security">High Security (24/7 Guards + CCTV)</option>
                <option value="moderate-security">Moderate Security (CCTV + Access Control)</option>
                <option value="basic-security">Basic Security (Fencing/Gates)</option>
                <option value="minimal-security">Minimal Security</option>
                <option value="no-security">No Security</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Address *
            </label>
            <input
              type="text"
              placeholder="Enter complete storage address"
              value={formData.insuranceInfo.storageAddress || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'storageAddress', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {getFieldError('storageAddress') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('storageAddress')}
              </p>
            )}
          </div>
        </div>

        {/* Additional Equipment & Modifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Equipment & Modifications</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Equipment/Modifications
            </label>
            <div className="space-y-3">
              {[
                { value: 'avionics-upgrade', label: 'Avionics Upgrade' },
                { value: 'gps-navigation', label: 'GPS Navigation System' },
                { value: 'autopilot', label: 'Autopilot System' },
                { value: 'weather-radar', label: 'Weather Radar' },
                { value: 'custom-interior', label: 'Custom Interior' },
                { value: 'engine-modification', label: 'Engine Modifications' },
                { value: 'safety-equipment', label: 'Additional Safety Equipment' },
                { value: 'entertainment-system', label: 'Entertainment System' },
                { value: 'communication-equipment', label: 'Advanced Communication Equipment' },
                { value: 'fishing-equipment', label: 'Fishing Equipment (Marine)' },
                { value: 'diving-equipment', label: 'Diving Equipment (Marine)' },
                { value: 'solar-panels', label: 'Solar Panels' }
              ].map((equipment) => (
                <label key={equipment.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={equipment.value}
                    checked={(formData.insuranceInfo.additionalEquipment || []).includes(equipment.value)}
                    onChange={(e) => {
                      const currentEquipment = formData.insuranceInfo.additionalEquipment || [];
                      const updatedEquipment = e.target.checked
                        ? [...currentEquipment, equipment.value]
                        : currentEquipment.filter((eq: string) => eq !== equipment.value);
                      updateFormData('insuranceInfo', 'additionalEquipment', updatedEquipment);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{equipment.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value of Additional Equipment
            </label>
            <select
              value={formData.insuranceInfo.additionalEquipmentValue || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'additionalEquipmentValue', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Equipment Value</option>
              <option value="0-25k">R0 - R25,000</option>
              <option value="25k-50k">R25,000 - R50,000</option>
              <option value="50k-100k">R50,000 - R100,000</option>
              <option value="100k-250k">R100,000 - R250,000</option>
              <option value="250k-500k">R250,000 - R500,000</option>
              <option value="500k-plus">R500,000+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Operations Details Step (for Aviation & Marine Insurance)
  const renderOperationsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Operations Details</h3>
      
      <div className="space-y-4">
        {/* Usage Type */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Usage Type</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Use of Asset *
            </label>
            <select
              value={formData.insuranceInfo.primaryUse || ''}
              onChange={(e) => updateFormData('insuranceInfo', 'primaryUse', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Primary Use</option>
              <optgroup label="Aviation Uses">
                <option value="private-pleasure">Private/Pleasure Flying</option>
                <option value="commercial-passenger">Commercial Passenger Service</option>
                <option value="commercial-cargo">Commercial Cargo Transport</option>
                <option value="charter-services">Charter Services</option>
                <option value="flight-training">Flight Training</option>
                <option value="aerial-work">Aerial Work (Photography, Survey, etc.)</option>
                <option value="agricultural-spraying">Agricultural Spraying</option>
                <option value="emergency-services">Emergency Services</option>
                <option value="corporate-business">Corporate/Business Use</option>
              </optgroup>
              <optgroup label="Marine Uses">
                <option value="recreational-cruising">Recreational Cruising</option>
                <option value="sport-fishing">Sport Fishing</option>
                <option value="commercial-fishing">Commercial Fishing</option>
                <option value="charter-boat">Charter Boat Services</option>
                <option value="racing-competition">Racing/Competition</option>
                <option value="commercial-transport">Commercial Transport</option>
                <option value="offshore-work">Offshore Work Vessel</option>
                <option value="research-survey">Research/Survey Vessel</option>
                <option value="harbor-services">Harbor Services</option>
              </optgroup>
            </select>
            {getFieldError('primaryUse') && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {getFieldError('primaryUse')}
              </p>
            )}
          </div>
        </div>

        {/* Operating Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operating Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Operating Hours/Days *
              </label>
              <select
                value={formData.insuranceInfo.annualOperatingHours || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'annualOperatingHours', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Hours/Days</option>
                <optgroup label="Aviation (Hours per Year)">
                  <option value="0-25-hours">0-25 hours</option>
                  <option value="25-50-hours">25-50 hours</option>
                  <option value="50-100-hours">50-100 hours</option>
                  <option value="100-200-hours">100-200 hours</option>
                  <option value="200-500-hours">200-500 hours</option>
                  <option value="500-plus-hours">500+ hours</option>
                </optgroup>
                <optgroup label="Marine (Days per Year)">
                  <option value="0-10-days">0-10 days</option>
                  <option value="10-30-days">10-30 days</option>
                  <option value="30-60-days">30-60 days</option>
                  <option value="60-120-days">60-120 days</option>
                  <option value="120-200-days">120-200 days</option>
                  <option value="200-plus-days">200+ days</option>
                </optgroup>
              </select>
              {getFieldError('annualOperatingHours') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('annualOperatingHours')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Season *
              </label>
              <select
                value={formData.insuranceInfo.operatingSeason || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'operatingSeason', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Season</option>
                <option value="year-round">Year Round</option>
                <option value="seasonal-summer">Seasonal (Summer Only)</option>
                <option value="seasonal-winter">Seasonal (Winter Only)</option>
                <option value="spring-autumn">Spring & Autumn</option>
                <option value="weekend-only">Weekends Only</option>
                <option value="occasional-use">Occasional Use</option>
              </select>
              {getFieldError('operatingSeason') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('operatingSeason')}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Range/Area *
              </label>
              <select
                value={formData.insuranceInfo.operatingRange || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'operatingRange', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Operating Range</option>
                <optgroup label="Aviation Range">
                  <option value="local-training">Local Training Area (&lt;50km)</option>
                  <option value="regional-domestic">Regional/Domestic (South Africa)</option>
                  <option value="sadc-region">SADC Region</option>
                  <option value="africa-continent">Africa Continent</option>
                  <option value="international-worldwide">International/Worldwide</option>
                </optgroup>
                <optgroup label="Marine Range">
                  <option value="inland-waters">Inland Waters/Lakes</option>
                  <option value="coastal-waters">Coastal Waters (&lt;12 nautical miles)</option>
                  <option value="offshore-limited">Offshore Limited (12-50 nautical miles)</option>
                  <option value="offshore-extended">Offshore Extended (50+ nautical miles)</option>
                  <option value="international-waters">International Waters</option>
                </optgroup>
              </select>
              {getFieldError('operatingRange') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('operatingRange')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Night Operations
              </label>
              <select
                value={formData.insuranceInfo.nightOperations || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'nightOperations', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Night Operations</option>
                <option value="no-night-ops">No Night Operations</option>
                <option value="occasional-night">Occasional Night Operations</option>
                <option value="regular-night">Regular Night Operations</option>
                <option value="primarily-night">Primarily Night Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operator/Crew Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Operator/Crew Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Operator Experience *
              </label>
              <select
                value={formData.insuranceInfo.operatorExperience || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'operatorExperience', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Experience Level</option>
                <optgroup label="Aviation Experience">
                  <option value="student-pilot">Student Pilot</option>
                  <option value="private-pilot-new">Private Pilot (&lt;100 hours)</option>
                  <option value="private-pilot-experienced">Private Pilot (100-500 hours)</option>
                  <option value="commercial-pilot">Commercial Pilot (500-1500 hours)</option>
                  <option value="airline-transport-pilot">Airline Transport Pilot (1500+ hours)</option>
                  <option value="military-pilot">Military Pilot</option>
                </optgroup>
                <optgroup label="Marine Experience">
                  <option value="beginner-boater">Beginner (&lt;2 years)</option>
                  <option value="recreational-boater">Recreational Boater (2-10 years)</option>
                  <option value="experienced-boater">Experienced Boater (10+ years)</option>
                  <option value="commercial-skipper">Commercial Skipper</option>
                  <option value="yacht-master">Yacht Master</option>
                  <option value="professional-mariner">Professional Mariner</option>
                </optgroup>
              </select>
              {getFieldError('operatorExperience') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('operatorExperience')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Licenses/Certifications *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'private-pilot-license', label: 'Private Pilot License (PPL)' },
                  { value: 'commercial-pilot-license', label: 'Commercial Pilot License (CPL)' },
                  { value: 'instrument-rating', label: 'Instrument Rating (IR)' },
                  { value: 'multi-engine-rating', label: 'Multi-Engine Rating' },
                  { value: 'boat-license', label: 'Boat License/Skipper License' },
                  { value: 'yacht-master', label: 'Yacht Master Certificate' },
                  { value: 'radio-operators-license', label: 'Radio Operators License' },
                  { value: 'safety-course-certified', label: 'Safety Course Certified' }
                ].map((license) => (
                  <label key={license.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={license.value}
                      checked={(formData.insuranceInfo.validLicenses || []).includes(license.value)}
                      onChange={(e) => {
                        const currentLicenses = formData.insuranceInfo.validLicenses || [];
                        const updatedLicenses = e.target.checked
                          ? [...currentLicenses, license.value]
                          : currentLicenses.filter((l: string) => l !== license.value);
                        updateFormData('insuranceInfo', 'validLicenses', updatedLicenses);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{license.label}</span>
                  </label>
                ))}
              </div>
              {getFieldError('validLicenses') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('validLicenses')}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Qualified Operators
              </label>
              <select
                value={formData.insuranceInfo.numberOfOperators || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'numberOfOperators', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Number</option>
                <option value="1">1 Operator</option>
                <option value="2">2 Operators</option>
                <option value="3-5">3-5 Operators</option>
                <option value="6-10">6-10 Operators</option>
                <option value="10-plus">More than 10 Operators</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age of Youngest Regular Operator
              </label>
              <select
                value={formData.insuranceInfo.youngestOperatorAge || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'youngestOperatorAge', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Age Range</option>
                <option value="under-21">Under 21</option>
                <option value="21-25">21-25</option>
                <option value="26-30">26-30</option>
                <option value="31-40">31-40</option>
                <option value="41-50">41-50</option>
                <option value="over-50">Over 50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Factors & Safety */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors & Safety</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Claims History *
              </label>
              <select
                value={formData.insuranceInfo.claimsHistory || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'claimsHistory', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Claims History</option>
                <option value="no-claims">No Previous Claims</option>
                <option value="minor-claims">Minor Claims Only</option>
                <option value="moderate-claims">Some Claims (Under R100k)</option>
                <option value="major-claims">Major Claims (Over R100k)</option>
                <option value="multiple-claims">Multiple Claims</option>
              </select>
              {getFieldError('claimsHistory') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('claimsHistory')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety Equipment Level
              </label>
              <select
                value={formData.insuranceInfo.safetyEquipmentLevel || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'safetyEquipmentLevel', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Safety Level</option>
                <option value="basic-required">Basic Required Equipment</option>
                <option value="standard-safety">Standard Safety Equipment</option>
                <option value="enhanced-safety">Enhanced Safety Equipment</option>
                <option value="commercial-grade">Commercial Grade Safety</option>
                <option value="advanced-systems">Advanced Safety Systems</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              High-Risk Activities
            </label>
            <div className="space-y-3">
              {[
                { value: 'aerobatic-flying', label: 'Aerobatic Flying' },
                { value: 'formation-flying', label: 'Formation Flying' },
                { value: 'low-level-flying', label: 'Low Level Flying' },
                { value: 'mountain-flying', label: 'Mountain Flying' },
                { value: 'off-shore-fishing', label: 'Off-shore Fishing' },
                { value: 'racing-competition', label: 'Racing/Competition' },
                { value: 'water-skiing', label: 'Water Skiing/Towing' },
                { value: 'diving-operations', label: 'Diving Operations' },
                { value: 'cargo-external-load', label: 'External Load Operations' },
                { value: 'night-vision-ops', label: 'Night Vision Operations' }
              ].map((activity) => (
                <label key={activity.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={activity.value}
                    checked={(formData.insuranceInfo.highRiskActivities || []).includes(activity.value)}
                    onChange={(e) => {
                      const currentActivities = formData.insuranceInfo.highRiskActivities || [];
                      const updatedActivities = e.target.checked
                        ? [...currentActivities, activity.value]
                        : currentActivities.filter((a: string) => a !== activity.value);
                      updateFormData('insuranceInfo', 'highRiskActivities', updatedActivities);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{activity.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Claims Details - shown if claims exist */}
          {formData.insuranceInfo.claimsHistory && !formData.insuranceInfo.claimsHistory.includes('no-claims') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide details of previous claims *
              </label>
              <textarea
                rows={3}
                placeholder="Describe your previous claims including dates, amounts, and circumstances"
                value={formData.insuranceInfo.claimsDetails || ''}
                onChange={(e) => updateFormData('insuranceInfo', 'claimsDetails', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {getFieldError('claimsDetails') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('claimsDetails')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Business/Commercial Operations */}
        {(formData.insuranceInfo.primaryUse?.includes('commercial') || 
          formData.insuranceInfo.primaryUse?.includes('charter') || 
          formData.insuranceInfo.primaryUse?.includes('training')) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Commercial Operations</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.insuranceInfo.businessType || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'businessType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Business Type</option>
                  <option value="charter-operator">Charter Operator</option>
                  <option value="flight-school">Flight School</option>
                  <option value="cargo-operator">Cargo Operator</option>
                  <option value="tour-operator">Tour Operator</option>
                  <option value="fishing-charter">Fishing Charter</option>
                  <option value="transport-service">Transport Service</option>
                  <option value="rental-operator">Rental Operator</option>
                  <option value="maintenance-service">Maintenance Service</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue
                </label>
                <select
                  value={formData.insuranceInfo.annualRevenue || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'annualRevenue', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Revenue Range</option>
                  <option value="0-100k">R0 - R100,000</option>
                  <option value="100k-500k">R100,000 - R500,000</option>
                  <option value="500k-1m">R500,000 - R1,000,000</option>
                  <option value="1m-5m">R1,000,000 - R5,000,000</option>
                  <option value="5m-plus">R5,000,000+</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating Certificate/License
                </label>
                <select
                  value={formData.insuranceInfo.operatingCertificate || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'operatingCertificate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Certificate Status</option>
                  <option value="not-required">Not Required</option>
                  <option value="in-process">Application In Process</option>
                  <option value="valid-certificate">Valid Certificate/License</option>
                  <option value="expired-certificate">Expired Certificate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Commercial Operation
                </label>
                <select
                  value={formData.insuranceInfo.yearsInCommercialOperation || ''}
                  onChange={(e) => updateFormData('insuranceInfo', 'yearsInCommercialOperation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Experience</option>
                  <option value="new-business">New Business</option>
                  <option value="1-2-years">1-2 years</option>
                  <option value="3-5-years">3-5 years</option>
                  <option value="6-10-years">6-10 years</option>
                  <option value="10-plus-years">10+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Driver Details Step (for Auto Insurance)
  const renderDriverDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Driver Information</h3>
      
      <div className="space-y-4">
        {/* License Type */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of licence do you have? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="licenceType"
                value="rsa-drivers"
                checked={formData.needsAnalysis.driverDetails?.licenceType === 'rsa-drivers'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    driverDetails: {
                      ...prev.needsAnalysis.driverDetails!,
                      licenceType: e.target.value as 'rsa-drivers' | 'rsa-learners' | 'international'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>RSA Driver Licence</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="licenceType"
                value="rsa-learners"
                checked={formData.needsAnalysis.driverDetails?.licenceType === 'rsa-learners'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    driverDetails: {
                      ...prev.needsAnalysis.driverDetails!,
                      licenceType: e.target.value as 'rsa-drivers' | 'rsa-learners' | 'international'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>RSA Learners Licence</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="licenceType"
                value="international"
                checked={formData.needsAnalysis.driverDetails?.licenceType === 'international'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    driverDetails: {
                      ...prev.needsAnalysis.driverDetails!,
                      licenceType: e.target.value as 'rsa-drivers' | 'rsa-learners' | 'international'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>International Driver Licence</span>
            </label>
          </div>
          {validationErrors['needsAnalysis.driverDetails.licenceType'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.driverDetails.licenceType']}
              </p>
            </div>
          )}
        </div>

        {/* License First Issued */}
        <div className="bg-green-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When was your licence first issued? *
          </label>
          <select
            value={formData.needsAnalysis.driverDetails?.licenceFirstIssued || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              needsAnalysis: {
                ...prev.needsAnalysis,
                driverDetails: {
                  ...prev.needsAnalysis.driverDetails!,
                  licenceFirstIssued: e.target.value
                }
              }
            }))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors['needsAnalysis.driverDetails.licenceFirstIssued'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">Select time period</option>
            <option value="0-2">0-2 years ago</option>
            <option value="3-5">3-5 years ago</option>
            <option value="6-10">6-10 years ago</option>
            <option value="11-15">11-15 years ago</option>
            <option value="16-20">16-20 years ago</option>
            <option value="20+">More than 20 years ago</option>
          </select>
          {validationErrors['needsAnalysis.driverDetails.licenceFirstIssued'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.driverDetails.licenceFirstIssued']}
              </p>
            </div>
          )}
        </div>

        {/* Years Since Last Claim */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many years has it been since your last car accident or theft claim? *
          </label>
          <select
            value={formData.needsAnalysis.driverDetails?.yearsSinceLastClaim || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              needsAnalysis: {
                ...prev.needsAnalysis,
                driverDetails: {
                  ...prev.needsAnalysis.driverDetails!,
                  yearsSinceLastClaim: e.target.value
                }
              }
            }))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors['needsAnalysis.driverDetails.yearsSinceLastClaim'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">Select time period</option>
            <option value="never">Never had a claim</option>
            <option value="0-1">Less than 1 year ago</option>
            <option value="1-2">1-2 years ago</option>
            <option value="3-4">3-4 years ago</option>
            <option value="5+">5 or more years ago</option>
          </select>
          {validationErrors['needsAnalysis.driverDetails.yearsSinceLastClaim'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.driverDetails.yearsSinceLastClaim']}
              </p>
            </div>
          )}
        </div>

        {/* Drivers Under 25 */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Are there any drivers under 25 who will drive this vehicle? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="driversUnder25"
                value="true"
                checked={formData.needsAnalysis.driverDetails?.driversUnder25 === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    driverDetails: {
                      ...prev.needsAnalysis.driverDetails!,
                      driversUnder25: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>Yes, there are drivers under 25</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="driversUnder25"
                value="false"
                checked={formData.needsAnalysis.driverDetails?.driversUnder25 === false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    driverDetails: {
                      ...prev.needsAnalysis.driverDetails!,
                      driversUnder25: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>No drivers under 25</span>
            </label>
          </div>
          {validationErrors['needsAnalysis.driverDetails.driversUnder25'] && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {validationErrors['needsAnalysis.driverDetails.driversUnder25']}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Risk Factors Assessment Step
  const renderRiskFactorsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Assessment</h3>
      
      <div className="space-y-4">
        {insuranceType === 'auto' && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many years of driving experience do you have?
              </label>
              <select
                value={formData.needsAnalysis.riskFactors.drivingExperience || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    riskFactors: {
                      ...prev.needsAnalysis.riskFactors,
                      drivingExperience: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-20">11-20 years</option>
                <option value="20+">20+ years</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Where is the vehicle parked overnight?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="parkingLocation"
                    value="secure-garage"
                    checked={formData.needsAnalysis.riskFactors.parkingLocation === 'secure-garage'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          parkingLocation: e.target.value
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Secure garage/covered parking</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="parkingLocation"
                    value="driveway"
                    checked={formData.needsAnalysis.riskFactors.parkingLocation === 'driveway'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          parkingLocation: e.target.value
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>Driveway/open parking at home</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="parkingLocation"
                    value="street"
                    checked={formData.needsAnalysis.riskFactors.parkingLocation === 'street'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          parkingLocation: e.target.value
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span>On the street</span>
                </label>
              </div>
            </div>
          </>
        )}

        {['buildings-insurance', 'household-contents'].includes(insuranceType) && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What security features does your property have?
              </label>
              <div className="space-y-2">
                {['Alarm system', 'Security gates/burglar bars', 'Armed response', 'Electric fencing', 'Security guards', 'CCTV cameras'].map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      value={feature}
                      checked={formData.needsAnalysis.riskFactors.securityFeatures?.includes(feature) || false}
                      onChange={(e) => {
                        const features = formData.needsAnalysis.riskFactors.securityFeatures || [];
                        const updatedFeatures = e.target.checked
                          ? [...features, feature]
                          : features.filter((f: string) => f !== feature);
                        
                        setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              securityFeatures: updatedFeatures
                            }
                          }
                        }))
                      }}
                      className="mr-2"
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Security System Information */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Alarm system') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Security System Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alarm System Type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.alarmSystemType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            alarmSystemType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select alarm type</option>
                      <option value="basic-burglar">Basic Burglar Alarm</option>
                      <option value="monitored-alarm">Monitored Security Alarm</option>
                      <option value="smart-home">Smart Home Security System</option>
                      <option value="integrated-system">Integrated Security System</option>
                      <option value="wireless-alarm">Wireless Alarm System</option>
                      <option value="hardwired-alarm">Hardwired Alarm System</option>
                    </select>
                    {getFieldError('alarmSystemType') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('alarmSystemType')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Company/Provider *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ADT, Fidelity, Blue Security"
                      value={formData.needsAnalysis.riskFactors.securityCompany || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityCompany: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {getFieldError('securityCompany') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityCompany')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monitoring Type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.monitoringType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            monitoringType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select monitoring type</option>
                      <option value="24-7-monitored">24/7 Professional Monitoring</option>
                      <option value="self-monitored">Self-Monitored</option>
                      <option value="partial-monitoring">Partial Monitoring</option>
                      <option value="mobile-app">Mobile App Monitoring</option>
                      <option value="no-monitoring">No Monitoring</option>
                    </select>
                    {getFieldError('monitoringType') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('monitoringType')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.alarmInstallationDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            alarmInstallationDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security System Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Motion detectors',
                      'Door/window sensors',
                      'Glass break detectors',
                      'Panic buttons',
                      'Smoke detectors',
                      'Carbon monoxide detectors',
                      'Flood detectors',
                      'Temperature sensors',
                      'Pet-immune sensors',
                      'Remote control',
                      'Mobile app control',
                      'Backup battery'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={feature}
                          checked={formData.needsAnalysis.riskFactors.alarmFeatures?.includes(feature) || false}
                          onChange={(e) => {
                            const features = formData.needsAnalysis.riskFactors.alarmFeatures || [];
                            const updatedFeatures = e.target.checked
                              ? [...features, feature]
                              : features.filter((f: string) => f !== feature);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  alarmFeatures: updatedFeatures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Time (minutes) *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.responseTime || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            responseTime: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select response time</option>
                      <option value="0-5">0-5 minutes</option>
                      <option value="6-10">6-10 minutes</option>
                      <option value="11-15">11-15 minutes</option>
                      <option value="16-20">16-20 minutes</option>
                      <option value="21-30">21-30 minutes</option>
                      <option value="30+">More than 30 minutes</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {getFieldError('responseTime') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('responseTime')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate/Compliance Status
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.alarmCertification || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            alarmCertification: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select certification status</option>
                      <option value="fully-certified">Fully Certified/Compliant</option>
                      <option value="partially-certified">Partially Certified</option>
                      <option value="self-installed">Self-Installed System</option>
                      <option value="not-certified">Not Certified</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Security System Notes
                  </label>
                  <textarea
                    placeholder="Any additional details about your security system, recent upgrades, or special configurations..."
                    value={formData.needsAnalysis.riskFactors.securitySystemNotes || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          securitySystemNotes: e.target.value
                        }
                      }
                    }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Security Gates/Burglar Bars Details */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Security gates/burglar bars') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Gates/Burglar Bars Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Security Barriers *
                    </label>
                    <div className="space-y-2">
                      {['Security gates', 'Burglar bars', 'Security doors', 'Window grilles', 'Trellis doors'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            value={type}
                            checked={formData.needsAnalysis.riskFactors.securityBarrierTypes?.includes(type) || false}
                            onChange={(e) => {
                              const types = formData.needsAnalysis.riskFactors.securityBarrierTypes || [];
                              const updatedTypes = e.target.checked
                                ? [...types, type]
                                : types.filter((t: string) => t !== type);
                              
                              setFormData(prev => ({
                                ...prev,
                                needsAnalysis: {
                                  ...prev.needsAnalysis,
                                  riskFactors: {
                                    ...prev.needsAnalysis.riskFactors,
                                    securityBarrierTypes: updatedTypes
                                  }
                                }
                              }))
                            }}
                            className="mr-2"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    {getFieldError('securityBarrierTypes') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityBarrierTypes')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityBarrierMaterial || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityBarrierMaterial: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select material</option>
                      <option value="steel">Steel</option>
                      <option value="wrought-iron">Wrought Iron</option>
                      <option value="aluminum">Aluminum</option>
                      <option value="security-mesh">Security Mesh</option>
                      <option value="reinforced-steel">Reinforced Steel</option>
                      <option value="mixed">Mixed Materials</option>
                    </select>
                    {getFieldError('securityBarrierMaterial') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityBarrierMaterial')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityBarrierCoverage || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityBarrierCoverage: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select coverage</option>
                      <option value="all-windows-doors">All Windows and Doors</option>
                      <option value="ground-floor-only">Ground Floor Only</option>
                      <option value="main-entrance-only">Main Entrance Only</option>
                      <option value="partial">Partial Coverage</option>
                      <option value="all-entry-points">All Entry Points</option>
                    </select>
                    {getFieldError('securityBarrierCoverage') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityBarrierCoverage')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.securityBarrierInstallDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityBarrierInstallDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Armed Response Details */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Armed response') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Armed Response Service Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Provider *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ADT, Fidelity, Chubb, Blue Security"
                      value={formData.needsAnalysis.riskFactors.armedResponseProvider || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            armedResponseProvider: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {getFieldError('armedResponseProvider') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('armedResponseProvider')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Level *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.armedResponseLevel || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            armedResponseLevel: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select service level</option>
                      <option value="24-7-armed">24/7 Armed Response</option>
                      <option value="alarm-linked">Alarm-Linked Response</option>
                      <option value="panic-button">Panic Button Response</option>
                      <option value="patrol-service">Regular Patrol Service</option>
                      <option value="basic">Basic Armed Response</option>
                      <option value="premium">Premium Service Package</option>
                    </select>
                    {getFieldError('armedResponseLevel') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('armedResponseLevel')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Response Time *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.armedResponseTime || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            armedResponseTime: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select response time</option>
                      <option value="0-3">0-3 minutes</option>
                      <option value="4-6">4-6 minutes</option>
                      <option value="7-10">7-10 minutes</option>
                      <option value="11-15">11-15 minutes</option>
                      <option value="15+">More than 15 minutes</option>
                    </select>
                    {getFieldError('armedResponseTime') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('armedResponseTime')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Start Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.armedResponseContractDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            armedResponseContractDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Armed Response Officers per Call-out
                  </label>
                  <select
                    value={formData.needsAnalysis.riskFactors.armedResponseOfficers || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          armedResponseOfficers: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select number</option>
                    <option value="1">1 Officer</option>
                    <option value="2">2 Officers</option>
                    <option value="3+">3 or More Officers</option>
                    <option value="varies">Varies by Situation</option>
                  </select>
                </div>
              </div>
            )}

            {/* Electric Fencing Details */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Electric fencing') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Electric Fencing Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fence Type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.electricFenceType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select fence type</option>
                      <option value="standard-electric">Standard Electric Fence</option>
                      <option value="energized-wall">Energized Wall-Top</option>
                      <option value="razor-wire-electric">Razor Wire with Electric</option>
                      <option value="monitored-electric">Monitored Electric Fence</option>
                      <option value="smart-fence">Smart Electric Fence System</option>
                    </select>
                    {getFieldError('electricFenceType') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('electricFenceType')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voltage Level *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.electricFenceVoltage || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceVoltage: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select voltage</option>
                      <option value="5000-7000">5,000-7,000 volts (Standard)</option>
                      <option value="7000-9000">7,000-9,000 volts (High)</option>
                      <option value="9000+">9,000+ volts (Very High)</option>
                      <option value="adjustable">Adjustable Voltage</option>
                    </select>
                    {getFieldError('electricFenceVoltage') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('electricFenceVoltage')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Perimeter Coverage *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.electricFenceCoverage || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceCoverage: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select coverage</option>
                      <option value="full-perimeter">Full Perimeter</option>
                      <option value="front-back">Front and Back Only</option>
                      <option value="boundary-walls">Boundary Walls Only</option>
                      <option value="partial">Partial Coverage</option>
                      <option value="strategic-points">Strategic Points Only</option>
                    </select>
                    {getFieldError('electricFenceCoverage') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('electricFenceCoverage')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alarm Integration *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.electricFenceAlarmIntegration || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceAlarmIntegration: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select integration</option>
                      <option value="fully-integrated">Fully Integrated with Alarm System</option>
                      <option value="standalone">Standalone System</option>
                      <option value="monitoring-company">Linked to Monitoring Company</option>
                      <option value="sms-alerts">SMS/App Alerts Only</option>
                      <option value="no-alarm">No Alarm Integration</option>
                    </select>
                    {getFieldError('electricFenceAlarmIntegration') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('electricFenceAlarmIntegration')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Stafix, Nemtek, Gallagher"
                      value={formData.needsAnalysis.riskFactors.electricFenceInstaller || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceInstaller: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.electricFenceInstallDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceInstallDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsAnalysis.riskFactors.electricFenceBackupPower || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            electricFenceBackupPower: e.target.checked
                          }
                        }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Backup Power Supply/Battery</span>
                  </label>
                </div>
              </div>
            )}

            {/* Security Guards Details */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Security guards') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Security Guards Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guard Service Provider *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Fidelity, G4S, Stallion Security"
                      value={formData.needsAnalysis.riskFactors.securityGuardProvider || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardProvider: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {getFieldError('securityGuardProvider') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityGuardProvider')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guards on Duty *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityGuardCount || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardCount: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select number</option>
                      <option value="1">1 Guard</option>
                      <option value="2">2 Guards</option>
                      <option value="3-5">3-5 Guards</option>
                      <option value="6-10">6-10 Guards</option>
                      <option value="10+">More than 10 Guards</option>
                    </select>
                    {getFieldError('securityGuardCount') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityGuardCount')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guard Type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityGuardType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select guard type</option>
                      <option value="armed">Armed Guards</option>
                      <option value="unarmed">Unarmed Guards</option>
                      <option value="mixed">Mix of Armed & Unarmed</option>
                    </select>
                    {getFieldError('securityGuardType') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityGuardType')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Hours *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityGuardHours || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardHours: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select coverage</option>
                      <option value="24-7">24/7 Coverage</option>
                      <option value="nighttime">Nighttime Only (6PM-6AM)</option>
                      <option value="daytime">Daytime Only (6AM-6PM)</option>
                      <option value="business-hours">Business Hours Only</option>
                      <option value="weekends">Weekends Only</option>
                      <option value="custom">Custom Schedule</option>
                    </select>
                    {getFieldError('securityGuardHours') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('securityGuardHours')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guard Station Location
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.securityGuardLocation || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardLocation: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select location</option>
                      <option value="main-entrance">Main Entrance</option>
                      <option value="multiple-points">Multiple Entry Points</option>
                      <option value="roving-patrol">Roving Patrol</option>
                      <option value="guardhouse">Guardhouse/Security Post</option>
                      <option value="perimeter">Perimeter Patrol</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Start Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.securityGuardContractDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardContractDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsAnalysis.riskFactors.securityGuardTraining || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            securityGuardTraining: e.target.checked
                          }
                        }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Guards Have PSIRA Registration & Training</span>
                  </label>
                </div>
              </div>
            )}

            {/* CCTV Cameras Details */}
            {formData.needsAnalysis.riskFactors.securityFeatures?.includes('CCTV cameras') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">CCTV Camera System Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Cameras *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cctvCameraCount || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvCameraCount: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select number</option>
                      <option value="1-2">1-2 Cameras</option>
                      <option value="3-5">3-5 Cameras</option>
                      <option value="6-10">6-10 Cameras</option>
                      <option value="11-20">11-20 Cameras</option>
                      <option value="20+">More than 20 Cameras</option>
                    </select>
                    {getFieldError('cctvCameraCount') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('cctvCameraCount')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camera Type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cctvCameraType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvCameraType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select camera type</option>
                      <option value="analog">Analog Cameras</option>
                      <option value="ip-cameras">IP/Network Cameras</option>
                      <option value="hd-cameras">HD/4K Cameras</option>
                      <option value="ptz-cameras">PTZ (Pan-Tilt-Zoom) Cameras</option>
                      <option value="smart-cameras">Smart/AI Cameras</option>
                      <option value="mixed">Mixed Camera Types</option>
                    </select>
                    {getFieldError('cctvCameraType') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('cctvCameraType')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recording System *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cctvRecordingSystem || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvRecordingSystem: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select recording system</option>
                      <option value="dvr">DVR (Digital Video Recorder)</option>
                      <option value="nvr">NVR (Network Video Recorder)</option>
                      <option value="cloud-storage">Cloud Storage</option>
                      <option value="hybrid">Hybrid (Local + Cloud)</option>
                      <option value="no-recording">Live View Only (No Recording)</option>
                    </select>
                    {getFieldError('cctvRecordingSystem') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('cctvRecordingSystem')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Capacity *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cctvStorageCapacity || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvStorageCapacity: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select storage duration</option>
                      <option value="7-days">7 Days</option>
                      <option value="14-days">14 Days</option>
                      <option value="30-days">30 Days</option>
                      <option value="60-days">60 Days</option>
                      <option value="90-days">90+ Days</option>
                    </select>
                    {getFieldError('cctvStorageCapacity') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('cctvStorageCapacity')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camera Coverage *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cctvCoverage || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvCoverage: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select coverage</option>
                      <option value="full-perimeter">Full Perimeter Coverage</option>
                      <option value="entry-exit">Entry/Exit Points Only</option>
                      <option value="high-risk-areas">High-Risk Areas Only</option>
                      <option value="interior-exterior">Interior & Exterior</option>
                      <option value="partial">Partial Coverage</option>
                    </select>
                    {getFieldError('cctvCoverage') && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('cctvCoverage')}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Date
                    </label>
                    <input
                      type="month"
                      value={formData.needsAnalysis.riskFactors.cctvInstallDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvInstallDate: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Night vision',
                      'Motion detection',
                      'Audio recording',
                      'Remote viewing',
                      'Mobile app access',
                      'Facial recognition',
                      'License plate recognition',
                      'Two-way audio',
                      'Weather resistant'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={feature}
                          checked={formData.needsAnalysis.riskFactors.cctvFeatures?.includes(feature) || false}
                          onChange={(e) => {
                            const features = formData.needsAnalysis.riskFactors.cctvFeatures || [];
                            const updatedFeatures = e.target.checked
                              ? [...features, feature]
                              : features.filter((f: string) => f !== feature);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  cctvFeatures: updatedFeatures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsAnalysis.riskFactors.cctvMonitored || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cctvMonitored: e.target.checked
                          }
                        }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">System is Professionally Monitored</span>
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {(insuranceType === 'public-liability' || insuranceType === 'small-business' || 
          insuranceType === 'commercial-property' || insuranceType === 'transport-insurance' ||
          insuranceType === 'body-corporates' || insuranceType === 'engineering-construction' ||
          insuranceType === 'aviation-marine') && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What industry sector is your business in?
            </label>
            <select
              value={formData.needsAnalysis.riskFactors.businessSector || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                needsAnalysis: {
                  ...prev.needsAnalysis,
                  riskFactors: {
                    ...prev.needsAnalysis.riskFactors,
                    businessSector: e.target.value
                  }
                }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select industry sector</option>
              <option value="professional-services">Professional Services</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="hospitality">Hospitality & Tourism</option>
              <option value="construction">Construction</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Public Liability Specific Risk Assessment */}
        {insuranceType === 'public-liability' && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Public Liability Risk Factors</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue/Turnover *
                  </label>
                  <select
                    value={formData.needsAnalysis.riskFactors.annualRevenue || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          annualRevenue: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select revenue range</option>
                    <option value="under-500k">Under R500,000</option>
                    <option value="500k-1m">R500,000 - R1,000,000</option>
                    <option value="1m-5m">R1,000,000 - R5,000,000</option>
                    <option value="5m-10m">R5,000,000 - R10,000,000</option>
                    <option value="over-10m">Over R10,000,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you had any public liability claims in the past 5 years? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publicLiabilityClaims"
                        value="no"
                        checked={formData.needsAnalysis.riskFactors.publicLiabilityClaims === 'no'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              publicLiabilityClaims: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>No claims</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publicLiabilityClaims"
                        value="yes"
                        checked={formData.needsAnalysis.riskFactors.publicLiabilityClaims === 'yes'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              publicLiabilityClaims: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Yes, I have had claims</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What types of activities does your business engage in? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Client consultation',
                      'Product sales',
                      'Installation services',
                      'Maintenance/repairs',
                      'Public events',
                      'Property access',
                      'Equipment operation',
                      'Transportation services'
                    ].map((activity) => (
                      <label key={activity} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={activity}
                          checked={formData.needsAnalysis.riskFactors.businessActivities?.includes(activity) || false}
                          onChange={(e) => {
                            const activities = formData.needsAnalysis.riskFactors.businessActivities || [];
                            const updatedActivities = e.target.checked
                              ? [...activities, activity]
                              : activities.filter((a: string) => a !== activity);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  businessActivities: updatedActivities
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{activity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Small Business Specific Risk Assessment */}
        {insuranceType === 'small-business' && (
          <>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Small Business Risk Assessment</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business premises type *
                  </label>
                  <select
                    value={formData.needsAnalysis.riskFactors.premisesType || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          premisesType: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select premises type</option>
                    <option value="home-based">Home-based business</option>
                    <option value="rented-office">Rented office/shop</option>
                    <option value="owned-property">Owned commercial property</option>
                    <option value="shared-workspace">Shared workspace/co-working</option>
                    <option value="mobile-business">Mobile/no fixed premises</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Business equipment and assets (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Computers/IT equipment',
                      'Office furniture',
                      'Specialized machinery',
                      'Inventory/stock',
                      'Vehicles',
                      'Tools and equipment',
                      'Cash on premises',
                      'Customer data/records'
                    ].map((asset) => (
                      <label key={asset} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={asset}
                          checked={formData.needsAnalysis.riskFactors.businessAssets?.includes(asset) || false}
                          onChange={(e) => {
                            const assets = formData.needsAnalysis.riskFactors.businessAssets || [];
                            const updatedAssets = e.target.checked
                              ? [...assets, asset]
                              : assets.filter((a: string) => a !== asset);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  businessAssets: updatedAssets
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{asset}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security measures in place *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Alarm system',
                      'Security cameras',
                      'Access control',
                      'Security guards',
                      'Fire protection',
                      'Backup systems',
                      'Insurance safes',
                      'Cybersecurity measures'
                    ].map((measure) => (
                      <label key={measure} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={measure}
                          checked={formData.needsAnalysis.riskFactors.securityMeasures?.includes(measure) || false}
                          onChange={(e) => {
                            const measures = formData.needsAnalysis.riskFactors.securityMeasures || [];
                            const updatedMeasures = e.target.checked
                              ? [...measures, measure]
                              : measures.filter((m: string) => m !== measure);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  securityMeasures: updatedMeasures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{measure}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Commercial Property Specific Risk Assessment */}
        {insuranceType === 'commercial-property' && (
          <>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Commercial Property Risk Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building construction type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.constructionType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            constructionType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select construction type</option>
                      <option value="brick-concrete">Brick and concrete</option>
                      <option value="steel-frame">Steel frame</option>
                      <option value="mixed-construction">Mixed construction</option>
                      <option value="prefabricated">Prefabricated</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building age *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.buildingAge || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            buildingAge: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select building age</option>
                      <option value="0-5">0-5 years</option>
                      <option value="6-15">6-15 years</option>
                      <option value="16-30">16-30 years</option>
                      <option value="31-50">31-50 years</option>
                      <option value="over-50">Over 50 years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fire protection systems (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Fire alarms',
                      'Sprinkler system',
                      'Fire extinguishers',
                      'Emergency exits',
                      'Fire doors',
                      'Smoke detectors',
                      'Emergency lighting',
                      'Fire suppression system'
                    ].map((system) => (
                      <label key={system} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={system}
                          checked={formData.needsAnalysis.riskFactors.fireProtection?.includes(system) || false}
                          onChange={(e) => {
                            const systems = formData.needsAnalysis.riskFactors.fireProtection || [];
                            const updatedSystems = e.target.checked
                              ? [...systems, system]
                              : systems.filter((s: string) => s !== system);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  fireProtection: updatedSystems
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{system}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environmental/location risks *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Flood risk area',
                      'Near industrial area',
                      'High crime area',
                      'Earthquake zone',
                      'Coastal location',
                      'Fire risk area',
                      'Traffic congestion',
                      'No significant risks'
                    ].map((risk) => (
                      <label key={risk} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={risk}
                          checked={formData.needsAnalysis.riskFactors.environmentalRisks?.includes(risk) || false}
                          onChange={(e) => {
                            const risks = formData.needsAnalysis.riskFactors.environmentalRisks || [];
                            const updatedRisks = e.target.checked
                              ? [...risks, risk]
                              : risks.filter((r: string) => r !== risk);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  environmentalRisks: updatedRisks
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{risk}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Transport Insurance Specific Risk Assessment */}
        {insuranceType === 'transport-insurance' && (
          <>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Transport Risk Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary cargo/transport type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.cargoType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            cargoType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select cargo type</option>
                      <option value="general-goods">General goods</option>
                      <option value="food-beverages">Food and beverages</option>
                      <option value="hazardous-materials">Hazardous materials</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="construction-materials">Construction materials</option>
                      <option value="electronics">Electronics</option>
                      <option value="passengers">Passengers</option>
                      <option value="livestock">Livestock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average driver experience *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.driverExperienceAvg || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            driverExperienceAvg: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select experience level</option>
                      <option value="under-2">Under 2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-20">10-20 years</option>
                      <option value="over-20">Over 20 years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Route characteristics (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Urban routes',
                      'Highway routes',
                      'Rural routes',
                      'Cross-border',
                      'High-risk areas',
                      'Night operations',
                      'Long-distance',
                      'Local delivery only'
                    ].map((route) => (
                      <label key={route} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={route}
                          checked={formData.needsAnalysis.riskFactors.routeTypes?.includes(route) || false}
                          onChange={(e) => {
                            const routes = formData.needsAnalysis.riskFactors.routeTypes || [];
                            const updatedRoutes = e.target.checked
                              ? [...routes, route]
                              : routes.filter((r: string) => r !== route);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  routeTypes: updatedRoutes
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{route}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety and tracking systems *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Fleet tracking GPS',
                      'Driver monitoring',
                      'Vehicle maintenance logs',
                      'Safety training program',
                      'Emergency procedures',
                      'Load securing equipment',
                      'Communication systems',
                      'Regular safety audits'
                    ].map((safety) => (
                      <label key={safety} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={safety}
                          checked={formData.needsAnalysis.riskFactors.safetyMeasures?.includes(safety) || false}
                          onChange={(e) => {
                            const measures = formData.needsAnalysis.riskFactors.safetyMeasures || [];
                            const updatedMeasures = e.target.checked
                              ? [...measures, safety]
                              : measures.filter((m: string) => m !== safety);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  safetyMeasures: updatedMeasures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{safety}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Body Corporates Specific Risk Assessment */}
        {insuranceType === 'body-corporates' && (
          <>
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Body Corporate Risk Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of units in scheme *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.numberOfUnits || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            numberOfUnits: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select unit count</option>
                      <option value="under-10">Under 10 units</option>
                      <option value="10-25">10-25 units</option>
                      <option value="26-50">26-50 units</option>
                      <option value="51-100">51-100 units</option>
                      <option value="over-100">Over 100 units</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property management *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.propertyManagement || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            propertyManagement: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select management type</option>
                      <option value="professional-company">Professional management company</option>
                      <option value="self-managed">Self-managed by trustees</option>
                      <option value="caretaker">Live-in caretaker</option>
                      <option value="mixed-management">Mixed management approach</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Common area facilities (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Swimming pool',
                      'Gymnasium/clubhouse',
                      'Playground',
                      'Gardens/landscaping',
                      'Parking areas',
                      'Lifts/elevators',
                      'Security gates',
                      'Communal braai areas'
                    ].map((facility) => (
                      <label key={facility} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={facility}
                          checked={formData.needsAnalysis.riskFactors.commonFacilities?.includes(facility) || false}
                          onChange={(e) => {
                            const facilities = formData.needsAnalysis.riskFactors.commonFacilities || [];
                            const updatedFacilities = e.target.checked
                              ? [...facilities, facility]
                              : facilities.filter((f: string) => f !== facility);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  commonFacilities: updatedFacilities
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security and maintenance measures *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '24/7 security',
                      'Access control',
                      'CCTV surveillance',
                      'Regular maintenance schedule',
                      'Emergency procedures',
                      'Insurance assessments',
                      'Financial reserves',
                      'Professional contractors'
                    ].map((measure) => (
                      <label key={measure} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={measure}
                          checked={formData.needsAnalysis.riskFactors.maintenanceMeasures?.includes(measure) || false}
                          onChange={(e) => {
                            const measures = formData.needsAnalysis.riskFactors.maintenanceMeasures || [];
                            const updatedMeasures = e.target.checked
                              ? [...measures, measure]
                              : measures.filter((m: string) => m !== measure);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  maintenanceMeasures: updatedMeasures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{measure}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Engineering & Construction Specific Risk Assessment */}
        {insuranceType === 'engineering-construction' && (
          <>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Engineering & Construction Risk Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary project types *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.projectTypes || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            projectTypes: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select project type</option>
                      <option value="residential-construction">Residential construction</option>
                      <option value="commercial-construction">Commercial construction</option>
                      <option value="infrastructure">Infrastructure projects</option>
                      <option value="industrial-construction">Industrial construction</option>
                      <option value="renovation-maintenance">Renovation & maintenance</option>
                      <option value="specialized-engineering">Specialized engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average project value *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.projectValue || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            projectValue: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select project value</option>
                      <option value="under-500k">Under R500,000</option>
                      <option value="500k-2m">R500,000 - R2,000,000</option>
                      <option value="2m-10m">R2,000,000 - R10,000,000</option>
                      <option value="10m-50m">R10,000,000 - R50,000,000</option>
                      <option value="over-50m">Over R50,000,000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Safety and compliance measures (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Health & safety officer',
                      'Safety training programs',
                      'Personal protective equipment',
                      'Regular safety inspections',
                      'Emergency response plan',
                      'Compliance certifications',
                      'Quality control systems',
                      'Environmental compliance'
                    ].map((measure) => (
                      <label key={measure} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={measure}
                          checked={formData.needsAnalysis.riskFactors.safetyCompliance?.includes(measure) || false}
                          onChange={(e) => {
                            const measures = formData.needsAnalysis.riskFactors.safetyCompliance || [];
                            const updatedMeasures = e.target.checked
                              ? [...measures, measure]
                              : measures.filter((m: string) => m !== measure);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  safetyCompliance: updatedMeasures
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{measure}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialized equipment and machinery *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Cranes and lifting equipment',
                      'Excavators and earthmovers',
                      'Specialized tools',
                      'Scaffolding systems',
                      'Concrete equipment',
                      'Welding equipment',
                      'Testing instruments',
                      'Transportation vehicles'
                    ].map((equipment) => (
                      <label key={equipment} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={equipment}
                          checked={formData.needsAnalysis.riskFactors.specializedEquipment?.includes(equipment) || false}
                          onChange={(e) => {
                            const equipmentList = formData.needsAnalysis.riskFactors.specializedEquipment || [];
                            const updatedEquipment = e.target.checked
                              ? [...equipmentList, equipment]
                              : equipmentList.filter((eq: string) => eq !== equipment);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  specializedEquipment: updatedEquipment
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Aviation & Marine Specific Risk Assessment */}
        {insuranceType === 'aviation-marine' && (
          <>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Aviation & Marine Risk Assessment</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary operation type *
                  </label>
                  <select
                    value={formData.needsAnalysis.riskFactors.operationType || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          operationType: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select operation type</option>
                    <option value="commercial-aviation">Commercial aviation</option>
                    <option value="private-aviation">Private aviation</option>
                    <option value="marine-cargo">Marine cargo transport</option>
                    <option value="marine-passenger">Marine passenger transport</option>
                    <option value="marine-fishing">Marine fishing operations</option>
                    <option value="marine-recreational">Marine recreational</option>
                    <option value="mixed-operations">Mixed operations</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fleet/asset value range *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.assetValue || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            assetValue: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select asset value</option>
                      <option value="under-1m">Under R1,000,000</option>
                      <option value="1m-5m">R1,000,000 - R5,000,000</option>
                      <option value="5m-25m">R5,000,000 - R25,000,000</option>
                      <option value="25m-100m">R25,000,000 - R100,000,000</option>
                      <option value="over-100m">Over R100,000,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operating experience *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.operatingExperience || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            operatingExperience: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select experience</option>
                      <option value="under-2">Under 2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-20">10-20 years</option>
                      <option value="over-20">Over 20 years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Safety certifications and compliance (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'SACAA certification',
                      'ISM Code compliance',
                      'SOLAS compliance',
                      'Regular safety audits',
                      'Crew training programs',
                      'Maintenance schedules',
                      'Emergency procedures',
                      'Insurance surveys'
                    ].map((certification) => (
                      <label key={certification} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={certification}
                          checked={formData.needsAnalysis.riskFactors.safetyCertifications?.includes(certification) || false}
                          onChange={(e) => {
                            const certifications = formData.needsAnalysis.riskFactors.safetyCertifications || [];
                            const updatedCertifications = e.target.checked
                              ? [...certifications, certification]
                              : certifications.filter((c: string) => c !== certification);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  safetyCertifications: updatedCertifications
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{certification}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Operating regions/routes (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Domestic routes only',
                      'Regional Africa',
                      'International routes',
                      'Coastal waters',
                      'Open ocean',
                      'High-risk areas',
                      'Remote locations',
                      'Urban/populated areas'
                    ].map((region) => (
                      <label key={region} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={region}
                          checked={formData.needsAnalysis.riskFactors.operatingRegions?.includes(region) || false}
                          onChange={(e) => {
                            const regions = formData.needsAnalysis.riskFactors.operatingRegions || [];
                            const updatedRegions = e.target.checked
                              ? [...regions, region]
                              : regions.filter((r: string) => r !== region);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  operatingRegions: updatedRegions
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mining Rehabilitation Specific Risk Assessment */}
        {insuranceType === 'mining-rehabilitation' && (
          <>
            <div className="bg-stone-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Mining Rehabilitation Environmental Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mining operation type *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.miningType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            miningType: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select mining type</option>
                      <option value="coal-mining">Coal mining</option>
                      <option value="gold-mining">Gold mining</option>
                      <option value="platinum-mining">Platinum mining</option>
                      <option value="diamond-mining">Diamond mining</option>
                      <option value="iron-ore">Iron ore mining</option>
                      <option value="quarrying">Quarrying/aggregate</option>
                      <option value="other-minerals">Other minerals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rehabilitation scope *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.rehabilitationScope || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            rehabilitationScope: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select scope</option>
                      <option value="surface-rehabilitation">Surface rehabilitation</option>
                      <option value="underground-closure">Underground closure</option>
                      <option value="water-management">Water management</option>
                      <option value="comprehensive">Comprehensive rehabilitation</option>
                      <option value="partial-closure">Partial closure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Environmental risk factors (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Acid mine drainage',
                      'Ground water contamination',
                      'Soil contamination',
                      'Air quality impacts',
                      'Habitat restoration',
                      'Slope stability',
                      'Waste dump management',
                      'Community impacts'
                    ].map((risk) => (
                      <label key={risk} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={risk}
                          checked={formData.needsAnalysis.riskFactors.environmentalRisks?.includes(risk) || false}
                          onChange={(e) => {
                            const risks = formData.needsAnalysis.riskFactors.environmentalRisks || [];
                            const updatedRisks = e.target.checked
                              ? [...risks, risk]
                              : risks.filter((r: string) => r !== risk);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  environmentalRisks: updatedRisks
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{risk}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Regulatory compliance and monitoring (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'DMR compliance',
                      'Environmental impact assessments',
                      'Water use licenses',
                      'Regular monitoring programs',
                      'Community engagement',
                      'Financial provisioning',
                      'Expert consultations',
                      'Remediation technology'
                    ].map((compliance) => (
                      <label key={compliance} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={compliance}
                          checked={formData.needsAnalysis.riskFactors.regulatoryCompliance?.includes(compliance) || false}
                          onChange={(e) => {
                            const complianceList = formData.needsAnalysis.riskFactors.regulatoryCompliance || [];
                            const updatedCompliance = e.target.checked
                              ? [...complianceList, compliance]
                              : complianceList.filter((c: string) => c !== compliance);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  regulatoryCompliance: updatedCompliance
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{compliance}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated rehabilitation timeline *
                  </label>
                  <select
                    value={formData.needsAnalysis.riskFactors.rehabilitationTimeline || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        riskFactors: {
                          ...prev.needsAnalysis.riskFactors,
                          rehabilitationTimeline: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="under-2-years">Under 2 years</option>
                    <option value="2-5-years">2-5 years</option>
                    <option value="5-10-years">5-10 years</option>
                    <option value="10-20-years">10-20 years</option>
                    <option value="over-20-years">Over 20 years</option>
                    <option value="ongoing">Ongoing/perpetual</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* E-Hailing Specific Risk Assessment */}
        {insuranceType === 'e-hailing' && (
          <>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">E-Hailing Risk Assessment</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total e-hailing driving experience *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.ehailingExperience || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            ehailingExperience: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select experience</option>
                      <option value="under-6-months">Under 6 months</option>
                      <option value="6-12-months">6-12 months</option>
                      <option value="1-2-years">1-2 years</option>
                      <option value="2-5-years">2-5 years</option>
                      <option value="over-5-years">Over 5 years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average trips per day *
                    </label>
                    <select
                      value={formData.needsAnalysis.riskFactors.dailyTrips || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAnalysis: {
                          ...prev.needsAnalysis,
                          riskFactors: {
                            ...prev.needsAnalysis.riskFactors,
                            dailyTrips: e.target.value
                          }
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select daily trips</option>
                      <option value="under-10">Under 10 trips</option>
                      <option value="10-20">10-20 trips</option>
                      <option value="20-30">20-30 trips</option>
                      <option value="30-50">30-50 trips</option>
                      <option value="over-50">Over 50 trips</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Operating patterns and risks (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Night driving (10pm-5am)',
                      'Weekend operations',
                      'Airport runs',
                      'Long distance trips',
                      'High-density areas',
                      'Township areas',
                      'Corporate/business trips',
                      'Event/entertainment venues'
                    ].map((pattern) => (
                      <label key={pattern} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          value={pattern}
                          checked={formData.needsAnalysis.riskFactors.operatingPatterns?.includes(pattern) || false}
                          onChange={(e) => {
                            const patterns = formData.needsAnalysis.riskFactors.operatingPatterns || [];
                            const updatedPatterns = e.target.checked
                              ? [...patterns, pattern]
                              : patterns.filter((p: string) => p !== pattern);
                            
                            setFormData(prev => ({
                              ...prev,
                              needsAnalysis: {
                                ...prev.needsAnalysis,
                                riskFactors: {
                                  ...prev.needsAnalysis.riskFactors,
                                  operatingPatterns: updatedPatterns
                                }
                              }
                            }))
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-gray-700">{pattern}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle condition and safety *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="excellent"
                        checked={formData.needsAnalysis.riskFactors.vehicleCondition === 'excellent'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              vehicleCondition: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Excellent - new/well-maintained, regular service</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="good"
                        checked={formData.needsAnalysis.riskFactors.vehicleCondition === 'good'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              vehicleCondition: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Good - regular maintenance, minor wear</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="average"
                        checked={formData.needsAnalysis.riskFactors.vehicleCondition === 'average'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              vehicleCondition: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Average - some maintenance needed, visible wear</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous incidents or claims *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="previousIncidents"
                        value="none"
                        checked={formData.needsAnalysis.riskFactors.previousIncidents === 'none'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              previousIncidents: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>No incidents or claims</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="previousIncidents"
                        value="minor"
                        checked={formData.needsAnalysis.riskFactors.previousIncidents === 'minor'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              previousIncidents: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Minor incidents (no claims)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="previousIncidents"
                        value="claims"
                        checked={formData.needsAnalysis.riskFactors.previousIncidents === 'claims'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          needsAnalysis: {
                            ...prev.needsAnalysis,
                            riskFactors: {
                              ...prev.needsAnalysis.riskFactors,
                              previousIncidents: e.target.value
                            }
                          }
                        }))}
                        className="mr-2"
                      />
                      <span>Previous insurance claims</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Preferences and Budget Step
  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Budget & Preferences</h3>
      
      <div className="space-y-4">
        {/* Budget Range */}
        <div className="bg-green-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your maximum monthly budget for insurance? *
          </label>
          <select
            value={formData.needsAnalysis.budgetPreferences.maxMonthlyPremium}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              needsAnalysis: {
                ...prev.needsAnalysis,
                budgetPreferences: {
                  ...prev.needsAnalysis.budgetPreferences,
                  maxMonthlyPremium: parseInt(e.target.value)
                }
              }
            }))}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              hasFieldError('needsAnalysis.budgetPreferences.maxMonthlyPremium') 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            <option value="0">Select budget range</option>
            <option value="300">Up to R300</option>
            <option value="500">R300 - R500</option>
            <option value="800">R500 - R800</option>
            <option value="1200">R800 - R1,200</option>
            <option value="2000">R1,200 - R2,000</option>
            <option value="3000">R2,000+</option>
          </select>
          {hasFieldError('needsAnalysis.budgetPreferences.maxMonthlyPremium') && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {getFieldError('needsAnalysis.budgetPreferences.maxMonthlyPremium')}
            </p>
          )}
        </div>

        {/* Priority Factors */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What's most important to you? (Select all that apply)
          </label>
          <div className="space-y-2">
            {['Quality coverage', 'Best coverage', 'Quick claims processing', 'Good customer service', 'Brand reputation', 'Flexible payment options'].map((factor) => (
              <label key={factor} className="flex items-center">
                <input
                  type="checkbox"
                  value={factor}
                  checked={formData.needsAnalysis.budgetPreferences.priorityFactors?.includes(factor) || false}
                  onChange={(e) => {
                    const factors = formData.needsAnalysis.budgetPreferences.priorityFactors || [];
                    const updatedFactors = e.target.checked
                      ? [...factors, factor]
                      : factors.filter((f: string) => f !== factor);
                    
                    setFormData(prev => ({
                      ...prev,
                      needsAnalysis: {
                        ...prev.needsAnalysis,
                        budgetPreferences: {
                          ...prev.needsAnalysis.budgetPreferences,
                          priorityFactors: updatedFactors
                        }
                      }
                    }))
                  }}
                  className="mr-2"
                />
                <span>{factor}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price vs Coverage Balance */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you prioritize price vs coverage?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="prioritizePrice"
                value="true"
                checked={formData.needsAnalysis.budgetPreferences.prioritizePrice === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    budgetPreferences: {
                      ...prev.needsAnalysis.budgetPreferences,
                      prioritizePrice: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>Price is most important - show me the cheapest options</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="prioritizePrice"
                value="false"
                checked={formData.needsAnalysis.budgetPreferences.prioritizePrice === false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  needsAnalysis: {
                    ...prev.needsAnalysis,
                    budgetPreferences: {
                      ...prev.needsAnalysis.budgetPreferences,
                      prioritizePrice: e.target.value === 'true'
                    }
                  }
                }))}
                className="mr-2"
              />
              <span>Balance price and coverage - show me the best value options</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Review Information Step
  const renderReviewStep = () => {
    const handleEditStep = (stepId: string) => {
      const stepIndex = steps.findIndex(step => step.id === stepId);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Information</h3>
        <p className="text-gray-600 mb-6">
          Please review all the information you've provided. You can edit any section by clicking the "Edit" button next to it.
        </p>

        {/* Personal/Company Information Review */}
        {(insuranceType === 'public-liability' || insuranceType === 'small-business' || insuranceType === 'commercial-property') ? (
          // Company Information Review (for business insurance types)
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Company Information</h4>
              <button
                onClick={() => handleEditStep('company')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Company Name:</strong> {formData.companyInfo.companyName}</div>
              <div><strong>Registration Number:</strong> {formData.companyInfo.registrationNumber}</div>
              <div><strong>VAT Number:</strong> {formData.companyInfo.vatNumber}</div>
              <div><strong>Business Type:</strong> {
                formData.companyInfo.businessType === 'sole-proprietorship' ? 'Sole Proprietorship' :
                formData.companyInfo.businessType === 'partnership' ? 'Partnership' :
                formData.companyInfo.businessType === 'private-company' ? 'Private Company (Pty Ltd)' :
                formData.companyInfo.businessType === 'public-company' ? 'Public Company (Ltd)' :
                formData.companyInfo.businessType === 'close-corporation' ? 'Close Corporation (CC)' :
                formData.companyInfo.businessType === 'trust' ? 'Trust' :
                formData.companyInfo.businessType === 'ngo' ? 'Non-Governmental Organization (NGO)' :
                formData.companyInfo.businessType === 'npc' ? 'Non-Profit Company (NPC)' :
                formData.companyInfo.businessType === 'other' && formData.companyInfo.businessTypeOther ? formData.companyInfo.businessTypeOther :
                formData.companyInfo.businessType
              }</div>
              <div><strong>Industry Type:</strong> {
                formData.companyInfo.industryType === 'retail' ? 'Retail' :
                formData.companyInfo.industryType === 'manufacturing' ? 'Manufacturing' :
                formData.companyInfo.industryType === 'construction' ? 'Construction' :
                formData.companyInfo.industryType === 'hospitality' ? 'Hospitality' :
                formData.companyInfo.industryType === 'healthcare' ? 'Healthcare' :
                formData.companyInfo.industryType === 'education' ? 'Education' :
                formData.companyInfo.industryType === 'technology' ? 'Technology & IT' :
                formData.companyInfo.industryType === 'finance' ? 'Finance & Insurance' :
                formData.companyInfo.industryType === 'real-estate' ? 'Real Estate' :
                formData.companyInfo.industryType === 'transport' ? 'Transport & Logistics' :
                formData.companyInfo.industryType === 'agriculture' ? 'Agriculture' :
                formData.companyInfo.industryType === 'professional-services' ? 'Professional Services' :
                formData.companyInfo.industryType === 'other' && formData.companyInfo.industryTypeOther ? formData.companyInfo.industryTypeOther :
                formData.companyInfo.industryType
              }</div>
              <div><strong>Year Established:</strong> {formData.companyInfo.yearEstablished}</div>
              <div><strong>Number of Employees:</strong> {formData.companyInfo.numberOfEmployees}</div>
              <div><strong>Email:</strong> {formData.companyInfo.email}</div>
              <div><strong>Phone:</strong> {formData.companyInfo.phone}</div>
              {formData.companyInfo.alternativePhone && (
                <div><strong>Alternative Phone:</strong> {formData.companyInfo.alternativePhone}</div>
              )}
            </div>
            
            {/* Company Physical Address */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-2">Company Physical Address</h5>
              <div className="text-sm text-gray-700">
                {formData.companyInfo.streetNumber} {formData.companyInfo.streetName}, {formData.companyInfo.village}, {formData.companyInfo.areaCode}
                <br />
                {formData.companyInfo.province.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}, {
                  formData.companyInfo.country === 'other' && formData.companyInfo.countryOther
                    ? formData.companyInfo.countryOther
                    : formData.companyInfo.country.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }
              </div>
            </div>

            {/* Contact Person Information */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-2">Contact Person</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {formData.companyInfo.contactPersonName}</div>
                <div><strong>Position:</strong> {formData.companyInfo.contactPersonPosition}</div>
                <div><strong>Email:</strong> {formData.companyInfo.contactPersonEmail}</div>
                <div><strong>Phone:</strong> {formData.companyInfo.contactPersonPhone}</div>
              </div>
            </div>
          </div>
        ) : (
          // Personal Information Review (for non-business insurance types)
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
              <button
                onClick={() => handleEditStep('personal')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {formData.personalInfo.firstName} {formData.personalInfo.lastName}</div>
              <div><strong>Email:</strong> {formData.personalInfo.email}</div>
              <div><strong>Phone:</strong> {formData.personalInfo.phone}</div>
              <div><strong>ID Number:</strong> {formData.personalInfo.idNumber}</div>
              <div><strong>Marital Status:</strong> {formData.personalInfo.maritalStatus.charAt(0).toUpperCase() + formData.personalInfo.maritalStatus.slice(1)}</div>
              <div><strong>Occupation:</strong> {
                formData.personalInfo.occupation === 'self-employed' ? 'Self-Employed' :
                formData.personalInfo.occupation === 'employed' ? 'Work for an Employer' :
                formData.personalInfo.occupation === 'pensioner' ? 'Pensioner' :
                formData.personalInfo.occupation === 'unemployed' ? 'Unemployed' :
                formData.personalInfo.occupation
              }</div>
            </div>
            
            {/* Physical Address */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-2">Physical Address</h5>
              <div className="text-sm text-gray-700">
                {formData.personalInfo.streetNumber} {formData.personalInfo.streetName}, {formData.personalInfo.village}, {formData.personalInfo.areaCode}
                <br />
                {formData.personalInfo.province.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}, {
                  formData.personalInfo.country === 'other' && formData.personalInfo.countryOther
                    ? formData.personalInfo.countryOther
                    : formData.personalInfo.country.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }
              </div>
            </div>

            {/* Co-Insured Information */}
            {formData.coInsured?.hasCoInsured && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-2">Co-Insured Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {formData.coInsured.firstName} {formData.coInsured.lastName}</div>
                  <div><strong>Email:</strong> {formData.coInsured.email}</div>
                  <div><strong>Phone:</strong> {formData.coInsured.phone}</div>
                  <div><strong>ID Number:</strong> {formData.coInsured.idNumber}</div>
                  <div><strong>Relationship:</strong> {
                    formData.coInsured.relationship === 'spouse' ? 'Spouse' :
                    formData.coInsured.relationship === 'partner' ? 'Partner' :
                    formData.coInsured.relationship === 'parent' ? 'Parent' :
                    formData.coInsured.relationship === 'child' ? 'Child' :
                    formData.coInsured.relationship === 'sibling' ? 'Sibling' :
                    formData.coInsured.relationship === 'other-family' ? 'Other Family Member' :
                    formData.coInsured.relationship === 'business-partner' ? 'Business Partner' :
                    formData.coInsured.relationship === 'other' && formData.coInsured.relationshipOther ? formData.coInsured.relationshipOther :
                    formData.coInsured.relationship === 'other' ? 'Other' :
                    formData.coInsured.relationship
                  }</div>
                </div>
                {!formData.coInsured.sameAddress && (
                  <div className="mt-2">
                    <strong className="text-sm">Address:</strong>
                    <div className="text-sm text-gray-700">
                      {formData.coInsured.streetNumber} {formData.coInsured.streetName}, {formData.coInsured.village}, {formData.coInsured.areaCode}
                      <br />
                      {formData.coInsured.province?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}, {
                        formData.coInsured.country === 'other' && formData.coInsured.countryOther
                          ? formData.coInsured.countryOther
                          : formData.coInsured.country?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                      }
                    </div>
                  </div>
                )}
                {formData.coInsured.sameAddress && (
                  <div className="mt-2 text-sm text-gray-600">
                    <em>Same address as client</em>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Current Situation Review */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Current Situation</h4>
            <button
              onClick={() => handleEditStep('current-situation')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div><strong>Existing Insurance:</strong> {formData.needsAnalysis.currentSituation.hasExistingInsurance ? 'Yes' : 'No'}</div>
            {formData.needsAnalysis.currentSituation.hasExistingInsurance && formData.needsAnalysis.currentSituation.policyStartDate && (
              <div className="ml-4 text-gray-600">Policy Started: {new Date(formData.needsAnalysis.currentSituation.policyStartDate).toLocaleDateString()}</div>
            )}
            <div><strong>Claims History:</strong> {formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears ? 'Yes' : 'No claims in last 3 years'}</div>
            {formData.needsAnalysis.currentSituation.claimsHistory.hasClaimsLastThreeYears && (
              <div className="ml-4 space-y-1 text-gray-600">
                <div>• Number of claims in last 12 months: {
                  formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims === 1 ? 'One' :
                  formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims === 2 ? 'Two' :
                  formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims === 3 ? 'More than two' :
                  formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims
                }</div>
                <div>• Total claim amount: R{formData.needsAnalysis.currentSituation.claimsHistory.totalClaimAmount?.toLocaleString()}</div>
                <div>• Type of damage: {
                  formData.needsAnalysis.currentSituation.claimsHistory.damageType === 'other' && formData.needsAnalysis.currentSituation.claimsHistory.damageTypeOther
                    ? formData.needsAnalysis.currentSituation.claimsHistory.damageTypeOther
                    : formData.needsAnalysis.currentSituation.claimsHistory.damageType?.replace(/\b\w/g, l => l.toUpperCase())
                }</div>
                {formData.needsAnalysis.currentSituation.claimsHistory.incidentDescription && (
                  <div>• Incident description: {formData.needsAnalysis.currentSituation.claimsHistory.incidentDescription}</div>
                )}
                {formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims && 
                 formData.needsAnalysis.currentSituation.claimsHistory.numberOfClaims >= 2 &&
                 formData.needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation && (
                  <div>• Multiple claims explanation: {formData.needsAnalysis.currentSituation.claimsHistory.multipleClaimsExplanation}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coverage Needs Review */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Coverage Needs</h4>
            <button
              onClick={() => handleEditStep('coverage-needs')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div><strong>Coverage Level:</strong> {formData.needsAnalysis.coveragePreferences.coverageLevel}</div>
            <div><strong>Preferred Excess:</strong> R{formData.needsAnalysis.coveragePreferences.preferredExcess ? parseFloat(formData.needsAnalysis.coveragePreferences.preferredExcess).toLocaleString() : '0'}</div>
            <div><strong>Additional Coverage:</strong> {formData.needsAnalysis.coveragePreferences.additionalCoverage.length > 0 ? formData.needsAnalysis.coveragePreferences.additionalCoverage.join(', ') : 'None selected'}</div>
            {formData.needsAnalysis.coveragePreferences.additionalCoverRequirements && (
              <div><strong>Additional Cover Requirements:</strong> {formData.needsAnalysis.coveragePreferences.additionalCoverRequirements}</div>
            )}
          </div>
        </div>

        {/* Driver Details Review (for Auto Insurance) */}
        {insuranceType === 'auto' && formData.needsAnalysis.driverDetails && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Driver Details</h4>
              <button
                onClick={() => handleEditStep('driver-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Licence Type:</strong> {formData.needsAnalysis.driverDetails.licenceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
              <div><strong>Licence First Issued:</strong> {formData.needsAnalysis.driverDetails.licenceFirstIssued} years ago</div>
              <div><strong>Years Since Last Claim:</strong> {formData.needsAnalysis.driverDetails.yearsSinceLastClaim === 'never' ? 'Never had a claim' : formData.needsAnalysis.driverDetails.yearsSinceLastClaim}</div>
              <div><strong>Drivers Under 25:</strong> {formData.needsAnalysis.driverDetails.driversUnder25 ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Vehicle Details Review (for Auto Insurance) */}
        {insuranceType === 'auto' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Vehicle Details</h4>
              <button
                onClick={() => handleEditStep('vehicle-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.insuranceInfo.vehicleMake && (
                <div><strong>Vehicle Make:</strong> {formData.insuranceInfo.vehicleMake}</div>
              )}
              {formData.insuranceInfo.vehicleModel && (
                <div><strong>Vehicle Model:</strong> {formData.insuranceInfo.vehicleModel}</div>
              )}
              {formData.insuranceInfo.vehicleYear && (
                <div><strong>Year of Manufacture:</strong> {formData.insuranceInfo.vehicleYear}</div>
              )}
              {/* Vehicle Value shown in Vehicle Details component; removed from summary here */}
              {formData.insuranceInfo.mmCode && (
                <div><strong>M&M Code:</strong> {formData.insuranceInfo.mmCode}</div>
              )}
              {formData.insuranceInfo.vehicleUsage && (
                <div><strong>Primary Use:</strong> {
                  formData.insuranceInfo.vehicleUsage === 'private-domestic' ? 'Private & Domestic Use' :
                  formData.insuranceInfo.vehicleUsage === 'business' ? 'Business Use' :
                  formData.insuranceInfo.vehicleUsage
                }</div>
              )}
              <div><strong>Driver Same as Insured:</strong> {
                formData.insuranceInfo.driverSameAsInsured === true ? 'Yes' :
                formData.insuranceInfo.driverSameAsInsured === false ? 'No' :
                'Not specified'
              }</div>
              
              {/* Additional Driver Details */}
              {formData.insuranceInfo.driverSameAsInsured === false && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-2">Driver Information</h5>
                  <div className="space-y-1 ml-4 text-gray-600">
                    {formData.insuranceInfo.driverFirstName && formData.insuranceInfo.driverLastName && (
                      <div>• Full Name: {formData.insuranceInfo.driverFirstName} {formData.insuranceInfo.driverLastName}</div>
                    )}
                    {formData.insuranceInfo.driverIdNumber && (
                      <div>• ID Number: {formData.insuranceInfo.driverIdNumber}</div>
                    )}
                    {formData.insuranceInfo.driverContactNumber && (
                      <div>• Contact: {formData.insuranceInfo.driverContactNumber}</div>
                    )}
                    {formData.insuranceInfo.driverOccupation && (
                      <div>• Occupation: {formData.insuranceInfo.driverOccupation.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    )}
                    {formData.insuranceInfo.driverLicenseType && (
                      <div>• License Type: {
                        formData.insuranceInfo.driverLicenseType === 'international' && formData.insuranceInfo.internationalLicenseCountry
                          ? `International (${formData.insuranceInfo.internationalLicenseCountry})`
                          : formData.insuranceInfo.driverLicenseType.replace(/-/g, ' ').toUpperCase()
                      }</div>
                    )}
                    {formData.insuranceInfo.driverLicenseIssueDate && (
                      <div>• License Issue Date: {new Date(formData.insuranceInfo.driverLicenseIssueDate).toLocaleDateString()}</div>
                    )}
                    {formData.insuranceInfo.driverClaimsHistory && (
                      <div>• Claims History: {formData.insuranceInfo.driverClaimsHistory.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    )}
                    {formData.insuranceInfo.driverRelationship && (
                      <div>• Relationship: {formData.insuranceInfo.driverRelationship.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    )}
                    {formData.insuranceInfo.driverMaritalStatus && (
                      <div>• Marital Status: {formData.insuranceInfo.driverMaritalStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Details Review (for Buildings, Contents and Commercial Property Insurance) */}
        {['buildings-insurance', 'household-contents', 'commercial-property'].includes(insuranceType) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Property Details</h4>
              <button
                onClick={() => handleEditStep('property-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {insuranceType === 'commercial-property' && formData.insuranceInfo.propertyAddress && (
                <div><strong>Property Address:</strong> {formData.insuranceInfo.propertyAddress}</div>
              )}
              {formData.insuranceInfo.propertyType && (
                <div><strong>Property Type:</strong> {
                  insuranceType === 'commercial-property' 
                    ? formData.insuranceInfo.propertyType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    : formData.insuranceInfo.propertyType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }</div>
              )}
              {formData.insuranceInfo.propertyValue && (
                <div><strong>Property Value:</strong> R{formData.insuranceInfo.propertyValue.replace(/-/g, ' - R')}</div>
              )}
              {formData.insuranceInfo.contentsValue && (
                <div><strong>{insuranceType === 'commercial-property' ? 'Equipment/Stock Value' : 'Contents Value'}:</strong> R{formData.insuranceInfo.contentsValue.replace(/-/g, ' - R')}</div>
              )}
              {formData.insuranceInfo.propertyProvince && (
                <div><strong>Province:</strong> {formData.insuranceInfo.propertyProvince.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
              )}
            </div>
          </div>
        )}

        {/* Property Usage Review (for Commercial Property Insurance) */}
        {insuranceType === 'commercial-property' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Property Usage Details</h4>
              <button
                onClick={() => handleEditStep('property-usage')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.insuranceInfo.primaryBusinessActivity && (
                <div><strong>Primary Business Activity:</strong> {
                  formData.insuranceInfo.primaryBusinessActivity === 'other' 
                    ? formData.insuranceInfo.otherBusinessActivity || 'Other'
                    : formData.insuranceInfo.primaryBusinessActivity.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }</div>
              )}
              {formData.insuranceInfo.propertyOccupancy && (
                <div><strong>Property Occupancy:</strong> {formData.insuranceInfo.propertyOccupancy.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
              )}
              {formData.insuranceInfo.operatingHours && (
                <div><strong>Operating Hours:</strong> {formData.insuranceInfo.operatingHours.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.floorArea && (
                  <div><strong>Floor Area:</strong> {formData.insuranceInfo.floorArea} sqm</div>
                )}
                {formData.insuranceInfo.staffCount && (
                  <div><strong>Staff Count:</strong> {formData.insuranceInfo.staffCount.replace(/-/g, ' ')}</div>
                )}
              </div>
              {formData.insuranceInfo.securityMeasures && formData.insuranceInfo.securityMeasures.length > 0 && (
                <div><strong>Security Measures:</strong> {
                  formData.insuranceInfo.securityMeasures
                    .map((measure: string) => measure.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              {formData.insuranceInfo.hasSpecialRisks === 'yes' && formData.insuranceInfo.specialRisksDescription && (
                <div><strong>Special Risks:</strong> {formData.insuranceInfo.specialRisksDescription}</div>
              )}
              {formData.insuranceInfo.hasPropertyClaims === 'yes' && formData.insuranceInfo.propertyClaimsDetails && (
                <div><strong>Previous Claims:</strong> {formData.insuranceInfo.propertyClaimsDetails}</div>
              )}
            </div>
          </div>
        )}

        {/* Risk Factors Review (for Buildings/Contents Insurance) */}
        {['buildings-insurance', 'household-contents'].includes(insuranceType) && formData.needsAnalysis.riskFactors && Object.keys(formData.needsAnalysis.riskFactors).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Risk Assessment & Security</h4>
              <button
                onClick={() => handleEditStep('risk-factors')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.needsAnalysis.riskFactors.securityFeatures && formData.needsAnalysis.riskFactors.securityFeatures.length > 0 && (
                <div><strong>Security Features:</strong> {
                  formData.needsAnalysis.riskFactors.securityFeatures.join(', ')
                }</div>
              )}
              
              {formData.needsAnalysis.riskFactors.securityFeatures?.includes('Alarm system') && (
                <div className="ml-4 bg-gray-50 p-3 rounded space-y-1">
                  <h5 className="font-medium text-gray-900 text-sm">Alarm System Details:</h5>
                  {formData.needsAnalysis.riskFactors.alarmSystemType && (
                    <div className="text-gray-700"><strong>Type:</strong> {formData.needsAnalysis.riskFactors.alarmSystemType}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.securityCompany && (
                    <div className="text-gray-700"><strong>Security Company:</strong> {formData.needsAnalysis.riskFactors.securityCompany}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.monitoringType && (
                    <div className="text-gray-700"><strong>Monitoring:</strong> {formData.needsAnalysis.riskFactors.monitoringType}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.responseTime && (
                    <div className="text-gray-700"><strong>Response Time:</strong> {formData.needsAnalysis.riskFactors.responseTime}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.systemFeatures && formData.needsAnalysis.riskFactors.systemFeatures.length > 0 && (
                    <div className="text-gray-700"><strong>System Features:</strong> {formData.needsAnalysis.riskFactors.systemFeatures.join(', ')}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.certification && (
                    <div className="text-gray-700"><strong>Certification:</strong> {formData.needsAnalysis.riskFactors.certification}</div>
                  )}
                  {formData.needsAnalysis.riskFactors.systemNotes && (
                    <div className="text-gray-700"><strong>Additional Notes:</strong> {formData.needsAnalysis.riskFactors.systemNotes}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Business Details Review (for Business Insurance types) */}
        {['public-liability', 'small-business', 'commercial-property'].includes(insuranceType) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Business Details</h4>
              <button
                onClick={() => handleEditStep('business-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.insuranceInfo.businessName && (
                <div><strong>Business Name:</strong> {formData.insuranceInfo.businessName}</div>
              )}
              {formData.insuranceInfo.businessType && (
                <div><strong>Business Type:</strong> {
                  formData.insuranceInfo.businessType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }</div>
              )}
              {formData.insuranceInfo.businessRegistration && (
                <div><strong>Registration Number:</strong> {formData.insuranceInfo.businessRegistration}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.industrySector && (
                  <div><strong>Industry Sector:</strong> {
                    formData.insuranceInfo.industrySector.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
                {formData.insuranceInfo.employeeCount && (
                  <div><strong>Number of Employees:</strong> {formData.insuranceInfo.employeeCount}</div>
                )}
              </div>
              {formData.insuranceInfo.annualTurnover && (
                <div><strong>Annual Turnover:</strong> R{formData.insuranceInfo.annualTurnover.replace(/-/g, ' - R')}</div>
              )}
            </div>
          </div>
        )}

        {/* Business Assets Review (for Small Business Insurance) */}
        {insuranceType === 'small-business' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Business Assets & Equipment</h4>
              <button
                onClick={() => handleEditStep('business-assets')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.buildingValue && (
                  <div><strong>Building Value:</strong> {
                    formData.insuranceInfo.buildingValue === 'not-applicable' 
                      ? 'Not Applicable (Rented)'
                      : 'R' + formData.insuranceInfo.buildingValue.replace(/-/g, ' - R')
                  }</div>
                )}
                {formData.insuranceInfo.buildingOwnership && (
                  <div><strong>Building Ownership:</strong> {
                    formData.insuranceInfo.buildingOwnership.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.officeEquipmentValue && (
                  <div><strong>Office Equipment Value:</strong> R{formData.insuranceInfo.officeEquipmentValue.replace(/-/g, ' - R')}</div>
                )}
                {formData.insuranceInfo.specializedEquipmentValue && formData.insuranceInfo.specializedEquipmentValue !== '0' && (
                  <div><strong>Specialized Equipment Value:</strong> R{formData.insuranceInfo.specializedEquipmentValue.replace(/-/g, ' - R')}</div>
                )}
              </div>
              {formData.insuranceInfo.equipmentTypes && formData.insuranceInfo.equipmentTypes.length > 0 && (
                <div><strong>Equipment Types:</strong> {
                  formData.insuranceInfo.equipmentTypes
                    .map((type: string) => type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.stockValue && (
                  <div><strong>Stock/Inventory Value:</strong> {
                    formData.insuranceInfo.stockValue === '0' 
                      ? 'No Stock/Inventory'
                      : 'R' + formData.insuranceInfo.stockValue.replace(/-/g, ' - R')
                  }</div>
                )}
                {formData.insuranceInfo.stockType && (
                  <div><strong>Stock Type:</strong> {
                    formData.insuranceInfo.stockType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.cashOnPremises && (
                  <div><strong>Cash on Premises:</strong> R{formData.insuranceInfo.cashOnPremises.replace(/-/g, ' - R')}</div>
                )}
                {formData.insuranceInfo.moneyInTransit && formData.insuranceInfo.moneyInTransit !== '0' && (
                  <div><strong>Money in Transit:</strong> R{formData.insuranceInfo.moneyInTransit.replace(/-/g, ' - R')}</div>
                )}
              </div>
              {formData.insuranceInfo.requiresBusinessInterruption === 'yes' && (
                <div>
                  <strong>Business Interruption Coverage:</strong> Yes
                  {formData.insuranceInfo.monthlyTurnover && (
                    <span> (Monthly Turnover: R{formData.insuranceInfo.monthlyTurnover.replace(/-/g, ' - R')})</span>
                  )}
                  {formData.insuranceInfo.interruptionPeriod && (
                    <span> (Coverage Period: {formData.insuranceInfo.interruptionPeriod.replace(/-/g, ' ')})</span>
                  )}
                </div>
              )}
              {formData.insuranceInfo.additionalCoverages && formData.insuranceInfo.additionalCoverages.length > 0 && (
                <div><strong>Additional Coverages:</strong> {
                  formData.insuranceInfo.additionalCoverages
                    .map((coverage: string) => coverage.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              {formData.insuranceInfo.hasHighValueItems === 'yes' && formData.insuranceInfo.highValueItemsDetails && (
                <div><strong>High-Value Items:</strong> {formData.insuranceInfo.highValueItemsDetails}</div>
              )}
            </div>
          </div>
        )}

        {/* Fleet Details Review (for Transport Insurance) */}
        {insuranceType === 'transport-insurance' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Fleet Information</h4>
              <button
                onClick={() => handleEditStep('fleet-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.totalVehicles && (
                  <div><strong>Total Vehicles:</strong> {formData.insuranceInfo.totalVehicles.replace(/-/g, ' ')}</div>
                )}
                {formData.insuranceInfo.fleetOwnership && (
                  <div><strong>Fleet Ownership:</strong> {
                    formData.insuranceInfo.fleetOwnership.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.vehicleTypes && formData.insuranceInfo.vehicleTypes.length > 0 && (
                <div><strong>Vehicle Types:</strong> {
                  formData.insuranceInfo.vehicleTypes
                    .map((type: string) => type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.totalFleetValue && (
                  <div><strong>Fleet Value:</strong> R{formData.insuranceInfo.totalFleetValue.replace(/-/g, ' - R')}</div>
                )}
                {formData.insuranceInfo.averageFleetAge && (
                  <div><strong>Average Fleet Age:</strong> {formData.insuranceInfo.averageFleetAge.replace(/-/g, ' ')}</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.totalDrivers && (
                  <div><strong>Total Drivers:</strong> {formData.insuranceInfo.totalDrivers.replace(/-/g, ' ')}</div>
                )}
                {formData.insuranceInfo.driverAgeProfile && (
                  <div><strong>Driver Age Profile:</strong> {
                    formData.insuranceInfo.driverAgeProfile.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.minDriverExperience && (
                <div><strong>Min Driver Experience:</strong> {formData.insuranceInfo.minDriverExperience.replace(/-/g, ' ')}</div>
              )}
              {formData.insuranceInfo.securitySystems && formData.insuranceInfo.securitySystems.length > 0 && (
                <div><strong>Security Systems:</strong> {
                  formData.insuranceInfo.securitySystems
                    .map((system: string) => system.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
            </div>
          </div>
        )}

        {/* E-Hailing Details Review (for E-Hailing Insurance) */}
        {insuranceType === 'e-hailing' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">E-Hailing Service Details</h4>
              <button
                onClick={() => handleEditStep('e-hailing-details')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.primaryPlatform && (
                  <div><strong>Primary Platform:</strong> {
                    formData.insuranceInfo.primaryPlatform === 'uber' ? 'Uber' :
                    formData.insuranceInfo.primaryPlatform === 'bolt' ? 'Bolt (Taxify)' :
                    formData.insuranceInfo.primaryPlatform === 'didi' ? 'DiDi' :
                    formData.insuranceInfo.primaryPlatform === 'meter-taxi' ? 'Meter Taxi' :
                    formData.insuranceInfo.primaryPlatform === 'multiple' ? 'Multiple Platforms' :
                    formData.insuranceInfo.primaryPlatform.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
                {formData.insuranceInfo.driverRating && (
                  <div><strong>Driver Rating:</strong> {formData.insuranceInfo.driverRating.replace(/-/g, ' - ')} stars</div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.weeklyHours && (
                  <div><strong>Weekly Hours:</strong> {
                    formData.insuranceInfo.weeklyHours === 'under-20' ? 'Under 20 hours' :
                    formData.insuranceInfo.weeklyHours === 'over-50' ? 'Over 50 hours' :
                    formData.insuranceInfo.weeklyHours.replace(/-/g, ' - ') + ' hours'
                  }</div>
                )}
                {formData.insuranceInfo.operatingTimes && (
                  <div><strong>Operating Times:</strong> {
                    formData.insuranceInfo.operatingTimes.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.operatingAreas && formData.insuranceInfo.operatingAreas.length > 0 && (
                <div><strong>Operating Areas:</strong> {
                  formData.insuranceInfo.operatingAreas
                    .map((area: string) => {
                      const areaMap: {[key: string]: string} = {
                        'johannesburg-cbd': 'Johannesburg CBD',
                        'sandton': 'Sandton',
                        'cape-town-cbd': 'Cape Town CBD',
                        'durban-cbd': 'Durban CBD',
                        'pretoria': 'Pretoria',
                        'airports': 'Airports (OR Tambo, Cape Town International)',
                        'townships': 'Township Areas',
                        'suburbs': 'Suburban Areas',
                        'highways': 'Highway Routes',
                        'other-cities': 'Other Major Cities'
                      };
                      return areaMap[area] || area.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    })
                    .join(', ')
                }</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.monthlyIncome && (
                  <div><strong>Monthly Income:</strong> {
                    formData.insuranceInfo.monthlyIncome === 'under-5000' ? 'Under R5,000' :
                    formData.insuranceInfo.monthlyIncome === 'over-35000' ? 'Over R35,000' :
                    'R' + formData.insuranceInfo.monthlyIncome.replace(/-/g, ' - R')
                  }</div>
                )}
                {formData.insuranceInfo.vehicleOwnership && (
                  <div><strong>Vehicle Ownership:</strong> {
                    formData.insuranceInfo.vehicleOwnership.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.safetyFeatures && formData.insuranceInfo.safetyFeatures.length > 0 && (
                <div><strong>Safety Features:</strong> {
                  formData.insuranceInfo.safetyFeatures
                    .map((feature: string) => {
                      const featureMap: {[key: string]: string} = {
                        'dash-cam': 'Dash Camera',
                        'gps-tracking': 'GPS Tracking',
                        'panic-button': 'Panic Button',
                        'security-film': 'Window Security Film',
                        'first-aid-kit': 'First Aid Kit',
                        'fire-extinguisher': 'Fire Extinguisher',
                        'immobilizer': 'Engine Immobilizer',
                        'alarm-system': 'Car Alarm System'
                      };
                      return featureMap[feature] || feature.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    })
                    .join(', ')
                }</div>
              )}
            </div>
          </div>
        )}

        {/* Transport Operations Review (for Transport Insurance) */}
        {insuranceType === 'transport-insurance' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Transport Operations</h4>
              <button
                onClick={() => handleEditStep('transport-operations')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {formData.insuranceInfo.operationTypes && formData.insuranceInfo.operationTypes.length > 0 && (
                <div><strong>Operation Types:</strong> {
                  formData.insuranceInfo.operationTypes
                    .map((type: string) => type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.operatingArea && (
                  <div><strong>Operating Area:</strong> {
                    formData.insuranceInfo.operatingArea.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
                {formData.insuranceInfo.routeTypes && (
                  <div><strong>Route Types:</strong> {
                    formData.insuranceInfo.routeTypes.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.hasHighRiskRoutes === 'yes' && formData.insuranceInfo.highRiskRoutesDetails && (
                <div><strong>High-Risk Routes:</strong> {formData.insuranceInfo.highRiskRoutesDetails}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.dailyOperatingHours && (
                  <div><strong>Daily Operating Hours:</strong> {formData.insuranceInfo.dailyOperatingHours.replace(/-/g, ' ')}</div>
                )}
                {formData.insuranceInfo.weeklyOperatingDays && (
                  <div><strong>Weekly Operating Days:</strong> {formData.insuranceInfo.weeklyOperatingDays.replace(/-/g, ' ')}</div>
                )}
              </div>
              {formData.insuranceInfo.hasNightOperations && formData.insuranceInfo.hasNightOperations !== 'no' && (
                <div><strong>Night Operations:</strong> {
                  formData.insuranceInfo.hasNightOperations.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.maxLoadValue && (
                  <div><strong>Max Load Value:</strong> {
                    formData.insuranceInfo.maxLoadValue === 'not-applicable' 
                      ? 'Not Applicable'
                      : 'R' + formData.insuranceInfo.maxLoadValue.replace(/-/g, ' - R')
                  }</div>
                )}
                {formData.insuranceInfo.cargoSecurity && (
                  <div><strong>Cargo Security:</strong> {
                    formData.insuranceInfo.cargoSecurity.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
              {formData.insuranceInfo.cargoTypes && formData.insuranceInfo.cargoTypes.length > 0 && (
                <div><strong>Cargo Types:</strong> {
                  formData.insuranceInfo.cargoTypes
                    .map((cargo: string) => cargo.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                    .join(', ')
                }</div>
              )}
              {formData.insuranceInfo.hasTransportClaims === 'yes' && formData.insuranceInfo.transportClaimsDetails && (
                <div><strong>Previous Claims:</strong> {formData.insuranceInfo.transportClaimsDetails}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.insuranceInfo.yearsInBusiness && (
                  <div><strong>Years in Business:</strong> {formData.insuranceInfo.yearsInBusiness.replace(/-/g, ' ')}</div>
                )}
                {formData.insuranceInfo.safetyRecord && (
                  <div><strong>Safety Record:</strong> {
                    formData.insuranceInfo.safetyRecord.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insurance Type Specific Information */}
        {insuranceType === 'engineering-construction' && (formData.projectName || formData.contractValue) && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Project Details</h4>
                <button
                  onClick={() => handleEditStep('project-details')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Project Name:</strong> {formData.projectName || 'Not provided'}</div>
                <div><strong>Location:</strong> {formData.projectLocation || 'Not provided'}</div>
                <div><strong>Contract Value:</strong> R{formData.contractValue ? Number(formData.contractValue).toLocaleString() : 'Not provided'}</div>
                <div><strong>Duration:</strong> {formData.projectDuration || 'Not provided'} months</div>
                <div><strong>Start Date:</strong> {formData.projectStartDate || 'Not provided'}</div>
                <div><strong>End Date:</strong> {formData.projectEndDate || 'Not provided'}</div>
                <div><strong>Principal:</strong> {formData.principalName || 'Not provided'}</div>
              </div>
              {formData.projectDescription && (
                <div className="mt-4 text-sm">
                  <strong>Description:</strong> {formData.projectDescription}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Construction Details</h4>
                <button
                  onClick={() => handleEditStep('construction-type')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Construction Type:</strong> {formData.constructionType || 'Not provided'}</div>
                <div><strong>Construction Method:</strong> {formData.constructionMethod || 'Not provided'}</div>
                {formData.maxHeight && <div><strong>Max Height:</strong> {formData.maxHeight}m</div>}
                {formData.maxDepth && <div><strong>Max Depth:</strong> {formData.maxDepth}m</div>}
                {formData.specialRisks && formData.specialRisks.length > 0 && (
                  <div><strong>Special Risks:</strong> {formData.specialRisks.join(', ')}</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Body Corporate Insurance Details Review */}
        {insuranceType === 'body-corporates' && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Scheme Details</h4>
                <button
                  onClick={() => handleEditStep('scheme-details')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.schemeName && (
                    <div><strong>Scheme Name:</strong> {formData.insuranceInfo.schemeName}</div>
                  )}
                  {formData.insuranceInfo.sectionalTitleNumber && (
                    <div><strong>Sectional Title Number:</strong> {formData.insuranceInfo.sectionalTitleNumber}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.yearBuilt && (
                    <div><strong>Year Built:</strong> {
                      formData.insuranceInfo.yearBuilt.replace(/-/g, ' - ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.schemeStatus && (
                    <div><strong>Scheme Status:</strong> {
                      formData.insuranceInfo.schemeStatus.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.totalUnits && (
                    <div><strong>Total Units:</strong> {
                      formData.insuranceInfo.totalUnits.replace(/-/g, ' ')
                    }</div>
                  )}
                  {formData.insuranceInfo.numberOfBuildings && (
                    <div><strong>Number of Buildings:</strong> {
                      formData.insuranceInfo.numberOfBuildings === '20+' 
                        ? 'More than 20 buildings'
                        : formData.insuranceInfo.numberOfBuildings.replace(/-/g, ' ')
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.numberOfStoreys && (
                    <div><strong>Number of Storeys:</strong> {
                      formData.insuranceInfo.numberOfStoreys === '30+' 
                        ? 'More than 30 storeys'
                        : formData.insuranceInfo.numberOfStoreys.replace(/-/g, ' ')
                    }</div>
                  )}
                  {formData.insuranceInfo.constructionType && (
                    <div><strong>Construction Type:</strong> {
                      formData.insuranceInfo.constructionType === 'other' 
                        ? formData.insuranceInfo.otherConstructionType || 'Other'
                        : formData.insuranceInfo.constructionType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                {formData.insuranceInfo.unitTypes && formData.insuranceInfo.unitTypes.length > 0 && (
                  <div><strong>Unit Types:</strong> {
                    formData.insuranceInfo.unitTypes
                      .map((type: string) => type.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.managementType && (
                    <div><strong>Management Type:</strong> {
                      formData.insuranceInfo.managementType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.managingAgentName && (
                    <div><strong>Managing Agent:</strong> {formData.insuranceInfo.managingAgentName}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.reserveFundStatus && (
                    <div><strong>Reserve Fund Status:</strong> {
                      formData.insuranceInfo.reserveFundStatus.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.levyCollectionRate && (
                    <div><strong>Levy Collection Rate:</strong> {
                      formData.insuranceInfo.levyCollectionRate.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.locationType && (
                    <div><strong>Location Type:</strong> {
                      formData.insuranceInfo.locationType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.distanceFromFireStation && (
                    <div><strong>Distance from Fire Station:</strong> {
                      formData.insuranceInfo.distanceFromFireStation.replace(/-/g, ' ')
                    }</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Common Areas & Facilities</h4>
                <button
                  onClick={() => handleEditStep('common-areas')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {formData.insuranceInfo.commonAreaStructures && formData.insuranceInfo.commonAreaStructures.length > 0 && (
                  <div><strong>Common Area Structures:</strong> {
                    formData.insuranceInfo.commonAreaStructures
                      .map((structure: string) => structure.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                {formData.insuranceInfo.recreationalFacilities && formData.insuranceInfo.recreationalFacilities.length > 0 && (
                  <div><strong>Recreational Facilities:</strong> {
                    formData.insuranceInfo.recreationalFacilities
                      .map((facility: string) => facility.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                {formData.insuranceInfo.infrastructureSystems && formData.insuranceInfo.infrastructureSystems.length > 0 && (
                  <div><strong>Infrastructure Systems:</strong> {
                    formData.insuranceInfo.infrastructureSystems
                      .map((system: string) => system.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.landscapingExtent && (
                    <div><strong>Landscaping Extent:</strong> {
                      formData.insuranceInfo.landscapingExtent.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.waterFeatures && (
                    <div><strong>Water Features:</strong> {
                      formData.insuranceInfo.waterFeatures.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                {formData.insuranceInfo.outdoorAmenities && formData.insuranceInfo.outdoorAmenities.length > 0 && (
                  <div><strong>Outdoor Amenities:</strong> {
                    formData.insuranceInfo.outdoorAmenities
                      .map((amenity: string) => amenity.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.securityLevel && (
                    <div><strong>Security Level:</strong> {
                      formData.insuranceInfo.securityLevel.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.accessControlType && (
                    <div><strong>Access Control:</strong> {
                      formData.insuranceInfo.accessControlType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                {formData.insuranceInfo.additionalSecurityFeatures && formData.insuranceInfo.additionalSecurityFeatures.length > 0 && (
                  <div><strong>Additional Security Features:</strong> {
                    formData.insuranceInfo.additionalSecurityFeatures
                      .map((feature: string) => feature.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.maintenanceStandard && (
                    <div><strong>Maintenance Standard:</strong> {
                      formData.insuranceInfo.maintenanceStandard.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.cleaningService && (
                    <div><strong>Cleaning Service:</strong> {
                      formData.insuranceInfo.cleaningService.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Aviation & Marine Insurance Details Review */}
        {insuranceType === 'aviation-marine' && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Asset Details</h4>
                <button
                  onClick={() => handleEditStep('asset-details')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.primaryAssetType && (
                    <div><strong>Asset Type:</strong> {
                      formData.insuranceInfo.primaryAssetType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.assetManufacturer && (
                    <div><strong>Manufacturer:</strong> {formData.insuranceInfo.assetManufacturer}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.assetModel && (
                    <div><strong>Model:</strong> {formData.insuranceInfo.assetModel}</div>
                  )}
                  {formData.insuranceInfo.assetYear && (
                    <div><strong>Year:</strong> {formData.insuranceInfo.assetYear}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.assetRegistration && (
                    <div><strong>Registration:</strong> {formData.insuranceInfo.assetRegistration}</div>
                  )}
                  {formData.insuranceInfo.assetValue && (
                    <div><strong>Asset Value:</strong> {
                      formData.insuranceInfo.assetValue.replace(/-/g, ' - ').replace(/k/g, ',000').replace(/m/g, ',000,000').replace(/plus/g, '+')
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.assetCondition && (
                    <div><strong>Condition:</strong> {
                      formData.insuranceInfo.assetCondition.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.storageLocation && (
                    <div><strong>Storage:</strong> {
                      formData.insuranceInfo.storageLocation.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                {formData.insuranceInfo.storageAddress && (
                  <div><strong>Storage Address:</strong> {formData.insuranceInfo.storageAddress}</div>
                )}
                
                {/* Aviation Specific Details */}
                {(formData.insuranceInfo.primaryAssetType?.includes('aircraft') || 
                  formData.insuranceInfo.primaryAssetType?.includes('helicopter') || 
                  formData.insuranceInfo.primaryAssetType?.includes('glider') || 
                  formData.insuranceInfo.primaryAssetType?.includes('ultralight') || 
                  formData.insuranceInfo.primaryAssetType?.includes('drone')) && (
                  <>
                    {formData.insuranceInfo.engineType && (
                      <div><strong>Engine Type:</strong> {
                        formData.insuranceInfo.engineType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                      }</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.insuranceInfo.seatingCapacity && (
                        <div><strong>Seating Capacity:</strong> {
                          formData.insuranceInfo.seatingCapacity.replace(/-/g, ' ')
                        }</div>
                      )}
                      {formData.insuranceInfo.maxTakeoffWeight && (
                        <div><strong>MTOW:</strong> {
                          formData.insuranceInfo.maxTakeoffWeight.replace(/-/g, ' ')
                        }</div>
                      )}
                    </div>
                    {formData.insuranceInfo.totalFlightHours && (
                      <div><strong>Total Flight Hours:</strong> {formData.insuranceInfo.totalFlightHours}</div>
                    )}
                  </>
                )}
                
                {/* Marine Specific Details */}
                {(formData.insuranceInfo.primaryAssetType?.includes('yacht') || 
                  formData.insuranceInfo.primaryAssetType?.includes('vessel') || 
                  formData.insuranceInfo.primaryAssetType?.includes('boat') || 
                  formData.insuranceInfo.primaryAssetType?.includes('jet-ski')) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.insuranceInfo.vesselLength && (
                        <div><strong>Vessel Length:</strong> {
                          formData.insuranceInfo.vesselLength.replace(/-/g, ' ')
                        }</div>
                      )}
                      {formData.insuranceInfo.hullMaterial && (
                        <div><strong>Hull Material:</strong> {
                          formData.insuranceInfo.hullMaterial.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        }</div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.insuranceInfo.engineConfiguration && (
                        <div><strong>Engine Configuration:</strong> {
                          formData.insuranceInfo.engineConfiguration.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        }</div>
                      )}
                      {formData.insuranceInfo.maxSpeed && (
                        <div><strong>Max Speed:</strong> {formData.insuranceInfo.maxSpeed} knots</div>
                      )}
                    </div>
                  </>
                )}
                
                {formData.insuranceInfo.additionalEquipment && formData.insuranceInfo.additionalEquipment.length > 0 && (
                  <div><strong>Additional Equipment:</strong> {
                    formData.insuranceInfo.additionalEquipment
                      .map((equipment: string) => equipment.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                {formData.insuranceInfo.additionalEquipmentValue && (
                  <div><strong>Equipment Value:</strong> {
                    formData.insuranceInfo.additionalEquipmentValue.replace(/-/g, ' - ').replace(/k/g, ',000').replace(/plus/g, '+')
                  }</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Operations Details</h4>
                <button
                  onClick={() => handleEditStep('operations')}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {formData.insuranceInfo.primaryUse && (
                  <div><strong>Primary Use:</strong> {
                    formData.insuranceInfo.primaryUse.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.annualOperatingHours && (
                    <div><strong>Annual Operating Hours/Days:</strong> {
                      formData.insuranceInfo.annualOperatingHours.replace(/-/g, ' ')
                    }</div>
                  )}
                  {formData.insuranceInfo.operatingSeason && (
                    <div><strong>Operating Season:</strong> {
                      formData.insuranceInfo.operatingSeason.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.operatingRange && (
                    <div><strong>Operating Range:</strong> {
                      formData.insuranceInfo.operatingRange.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.nightOperations && (
                    <div><strong>Night Operations:</strong> {
                      formData.insuranceInfo.nightOperations.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.insuranceInfo.operatorExperience && (
                    <div><strong>Operator Experience:</strong> {
                      formData.insuranceInfo.operatorExperience.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }</div>
                  )}
                  {formData.insuranceInfo.numberOfOperators && (
                    <div><strong>Number of Operators:</strong> {
                      formData.insuranceInfo.numberOfOperators.replace(/-/g, ' ')
                    }</div>
                  )}
                </div>
                {formData.insuranceInfo.validLicenses && formData.insuranceInfo.validLicenses.length > 0 && (
                  <div><strong>Valid Licenses:</strong> {
                    formData.insuranceInfo.validLicenses
                      .map((license: string) => license.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                {formData.insuranceInfo.claimsHistory && (
                  <div><strong>Claims History:</strong> {
                    formData.insuranceInfo.claimsHistory.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                  }</div>
                )}
                {formData.insuranceInfo.claimsDetails && (
                  <div><strong>Claims Details:</strong> {formData.insuranceInfo.claimsDetails}</div>
                )}
                {formData.insuranceInfo.highRiskActivities && formData.insuranceInfo.highRiskActivities.length > 0 && (
                  <div><strong>High-Risk Activities:</strong> {
                    formData.insuranceInfo.highRiskActivities
                      .map((activity: string) => activity.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
                      .join(', ')
                  }</div>
                )}
                
                {/* Commercial Operations Details */}
                {(formData.insuranceInfo.primaryUse?.includes('commercial') || 
                  formData.insuranceInfo.primaryUse?.includes('charter') || 
                  formData.insuranceInfo.primaryUse?.includes('training')) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.insuranceInfo.businessType && (
                        <div><strong>Business Type:</strong> {
                          formData.insuranceInfo.businessType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        }</div>
                      )}
                      {formData.insuranceInfo.annualRevenue && (
                        <div><strong>Annual Revenue:</strong> {
                          formData.insuranceInfo.annualRevenue.replace(/-/g, ' - ').replace(/k/g, ',000').replace(/m/g, ',000,000').replace(/plus/g, '+')
                        }</div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.insuranceInfo.operatingCertificate && (
                        <div><strong>Operating Certificate:</strong> {
                          formData.insuranceInfo.operatingCertificate.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        }</div>
                      )}
                      {formData.insuranceInfo.yearsInCommercialOperation && (
                        <div><strong>Years in Commercial Operation:</strong> {
                          formData.insuranceInfo.yearsInCommercialOperation.replace(/-/g, ' ')
                        }</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Budget Preferences Review */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Budget Preferences</h4>
            <button
              onClick={() => handleEditStep('preferences')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div><strong>Max Monthly Premium:</strong> R{formData.needsAnalysis.budgetPreferences.maxMonthlyPremium.toLocaleString()}</div>
            <div><strong>Prioritize Price:</strong> {formData.needsAnalysis.budgetPreferences.prioritizePrice ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Next Step:</strong> After reviewing your information, you'll be asked to provide consent and mandate authorization 
            to proceed with obtaining quotes on your behalf.
          </p>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleNext}
        >
          Continue to FAIS Disclosure
        </button>
      </div>
    );
  };

  // FAIS Disclosure Step
  const renderDisclosureStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">FAIS Disclosure Statement</h2>
        <p className="text-gray-600">
          Please review the following regulatory disclosure information before proceeding
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclosure Statement</h3>
            <p className="text-gray-700 mb-4">
              In compliance with sections 4 and 5 of the Financial Advisory and Intermediary Services (FAIS) Act, 
              the following information is brought to your attention:
            </p>
            <p className="text-gray-700 mb-4">
              MiBroker SA (Pty) Ltd (hereinafter referred to as "MiBroker") is an authorised Financial Services 
              Provider (FSP No: 51626). MiBroker accepts responsibility for all financial services rendered under its licence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Representative Information</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Representative:</strong> {assignedRepresentative ? `${assignedRepresentative.name} ${assignedRepresentative.surname}` : 'O.K Nkadimeng'}</li>
                <li><strong>Email:</strong> {assignedRepresentative ? assignedRepresentative.email : 'info@mibrokersa.co.za'}</li>
                <li><strong>Representative ID:</strong> {assignedRepresentative ? assignedRepresentative.id : 'REP-DEFAULT'}</li>
                <li><strong>Specializations:</strong> {assignedRepresentative ? assignedRepresentative.specializations.join(', ') : 'Short-Term Insurance'}</li>
                <li><strong>Rating:</strong> {assignedRepresentative ? `${assignedRepresentative.rating}/5.0 stars` : '4.8/5.0 stars'}</li>
                {assignedRepresentative && assignedRepresentative.activeClients && (
                  <li><strong>Active Clients:</strong> {assignedRepresentative.activeClients} current clients</li>
                )}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Categories of Authorisation</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Short-Term Insurance: Personal Lines</li>
                <li>• Short-Term Insurance: Commercial Lines</li>
                <li>• Short-Term Insurance: Personal Lines A1</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Product Suppliers</h4>
              <p className="text-sm text-gray-700">
                MiBroker only markets and distributes products from insurers who have provided us with written mandates, 
                ensuring that all products offered are authorised under our licence. Consequently, our advice and 
                recommendations are limited to products provided by these insurers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Remuneration</h4>
              <p className="text-sm text-gray-700">
                MiBroker is remunerated by product suppliers through commission and may also charge a broker fee, 
                as disclosed in your policy schedule. MiBroker does not hold more than 10% of shares in any product 
                supplier, and no more than 30% of its prior year's remuneration was received from any single supplier.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Professional Indemnity</h4>
              <p className="text-sm text-gray-700">
                MiBroker holds professional indemnity insurance as required by law.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Conflict of Interest</h4>
              <p className="text-sm text-gray-700">
                MiBroker maintains a Conflict of Interest Management Policy and a Register of Financial Interests, 
                Ownership Interests, and Business Relationships. These documents are available for inspection on request.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Commitment to Compliance</h4>
              <p className="text-sm text-gray-700">
                MiBroker is committed to full compliance with the FAIS Act and FSCA regulations, ensuring transparency 
                and fair treatment of clients.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Complaints Procedure</h4>
              <p className="text-sm text-blue-800">
                If you are dissatisfied with any aspect of the service, please submit your complaint in writing to 
                MiBroker at{' '}
                <a href="mailto:complaints@mibrokersa.co.za" className="underline font-medium">
                  complaints@mibrokersa.co.za
                </a>
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Licence Certificate</h4>
              <p className="text-sm text-gray-700">
                A copy of MiBroker's FSCA licence is available on request.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Please read this disclosure statement carefully. By proceeding to the next step, 
              you acknowledge that you have read and understood this regulatory information.
            </p>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={handleNext}
      >
        Continue to Consent & Mandate
      </button>
    </div>
  );

  // Consent & Mandate Step
  const renderConsentStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Client Consent and Mandate</h3>
      <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl">
        <div className="text-gray-800 text-sm mb-6 space-y-4">
          <p>
            By clicking "I Accept" below, I hereby provide MiBroker SA (Pty) Ltd with the following mandate and consent:
          </p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Mandate to Obtain Quotations</h4>
            <p>
              I authorise MiBroker SA to obtain initial, no-advice, no-obligation quotations on my behalf. For this purpose, I consent to MiBroker SA disclosing such personal, financial, and risk-related information as may be reasonably required to insurers and/or other authorised intermediaries, strictly for the purpose of obtaining quotations under this mandate.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Authority to Investigate and Make Recommendations</h4>
            <p>
              I further authorise MiBroker SA and its authorised representatives to conduct a needs analysis based on the information I provide, and to make recommendations regarding suitable insurance solutions. Where advice is given, MiBroker SA accepts responsibility for such advice in terms of FAIS requirements. I understand that if I fail to provide all requested information, only a limited analysis may be performed, and any recommendations made may be subject to limitations.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Consent to Verification and Information Sharing</h4>
            <p>
              I grant consent for insurers to verify and share my policy, claims, and risk information with other insurers, intermediaries, and relevant institutions. I further consent to insurers accessing credit information and related data from credit bureaus and other institutions for underwriting and fraud-prevention purposes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Acknowledgement</h4>
            <p>
              I confirm that this consent and mandate is provided voluntarily and with full knowledge of its purpose. I understand that this consent is necessary to enable insurers to underwrite my risk fairly and to combat fraud. This mandate shall remain valid until revoked by me in writing.
            </p>
          </div>
        </div>
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.consentGiven}
            onChange={e => setFormData(fd => ({
              ...fd,
              consentGiven: e.target.checked,
              consentTimestamp: e.target.checked ? new Date().toISOString() : undefined,
            }))}
            required
            className="mt-1"
          />
          <span className="text-gray-900 font-medium">
            I Accept and Provide Consent to MiBroker SA (Pty) Ltd
          </span>
        </label>
        {validationErrors['consentGiven'] && (
          <div className="mt-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{validationErrors['consentGiven']}</p>
          </div>
        )}
        {formData.consentGiven && (
          <div className="text-xs text-gray-500 mt-2">
            Consent given at: {formData.consentTimestamp}
          </div>
        )}
      </div>

      {/* Digital Signature Section */}
      <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Digital Signature *</h4>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your digital signature to authenticate this document. You can either draw your signature or upload an image of your signature.
        </p>

        {/* Signature Mode Selection */}
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setSignatureMode('draw')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              signatureMode === 'draw'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setSignatureMode('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              signatureMode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload Signature
          </button>
        </div>

        {/* Draw Signature Mode */}
        {signatureMode === 'draw' && (
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Draw your signature in the box below:</p>
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border border-gray-400 bg-white rounded cursor-crosshair w-full max-w-md"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none', maxWidth: '400px' }}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Clear
                </button>
                <p className="text-xs text-gray-500 self-center">
                  Use mouse or touch to sign
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Signature Mode */}
        {signatureMode === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Signature File
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Upload an image of your signature (PNG, JPG, etc. - max 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Signature Preview */}
        {formData.digitalSignature && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium mb-2">
              Signature captured successfully:
            </p>
            <div className="bg-white p-2 border rounded">
              <img
                src={formData.digitalSignature}
                alt="Digital signature"
                className="max-w-xs max-h-24 object-contain"
              />
            </div>
            {formData.signatureType === 'uploaded' && formData.signatureFileName && (
              <p className="text-xs text-gray-500 mt-1">
                File: {formData.signatureFileName}
              </p>
            )}
            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Remove Signature
            </button>
          </div>
        )}

        {/* Signature Error */}
        {validationErrors['digitalSignature'] && (
          <div className="mt-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{validationErrors['digitalSignature']}</p>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleNext}
        disabled={!formData.consentGiven || !formData.digitalSignature || loading}
      >
        I Accept & Continue
      </button>
    </div>
  );

  // Function to render the current step based on step state
  const renderCurrentStep = () => {
    const stepId = steps[currentStep]?.id;
    
    switch (stepId) {
      case 'personal':
        return renderPersonalInfoStep();
      case 'company':
        return renderCompanyInfo();
      case 'current-situation':
        return renderCurrentSituationStep();
      case 'coverage-needs':
        return renderCoverageNeedsStep();
      case 'vehicle-details':
        return renderVehicleDetailsStep();
      case 'driver-details':
        return renderDriverDetailsStep();
      case 'property-details':
        return renderPropertyDetailsStep();
      case 'business-details':
        return renderBusinessDetailsStep();
      case 'liability-details':
        return renderLiabilityDetailsStep();
      case 'business-assets':
        return renderBusinessAssetsStep();
      case 'property-usage':
        return renderPropertyUsageStep();
      case 'fleet-details':
        return renderFleetDetailsStep();
      case 'transport-operations':
        return renderTransportOperationsStep();
      case 'scheme-details':
        return renderSchemeDetailsStep();
      case 'common-areas':
        return renderCommonAreasStep();
      case 'project-details':
        return renderProjectDetailsStep();
      case 'construction-type':
        return renderConstructionTypeStep();
      case 'asset-details':
        return renderAssetDetailsStep();
      case 'operations':
        return renderOperationsStep();
      case 'e-hailing-details':
        return renderEHailingDetailsStep();
      case 'insurance-details':
        return renderInsuranceSpecificStep();
      case 'risk-factors':
        return renderRiskFactorsStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'review':
        return renderReviewStep();
      case 'disclosure':
        return renderDisclosureStep();
      case 'consent':
        return renderConsentStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  // Function to get the title for the current step
  const getStepTitle = () => {
    return steps[currentStep]?.title || 'Personal Details';
  };

  // Main component render
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Representative Information Banner */}
        {assignedRepresentative && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Assigned Representative
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {assignedRepresentative.name} {assignedRepresentative.surname}
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignedRepresentative.email} • Specializes in {assignedRepresentative.specializations.join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Representative ID</p>
                <p className="text-sm font-mono text-gray-700">{assignedRepresentative.id}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Form Header with insurance type and description */}
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{getInsuranceTitle(insuranceType)} Quote</h1>
            <p className="text-blue-100">Get personalized quotes from top South African insurers</p>
          </div>

          {/* Progress Bar Section */}
          {/* Progress Bar */}
          <div className="bg-white px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              {/* Show current step and total steps */}
              <span className="text-sm font-semibold text-gray-700">Step {currentStep + 1} of {totalSteps}</span>
              {/* Show percentage completion */}
              <span className="text-sm font-semibold text-gray-700">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content Area */}
          {/* Form Content */}
          <div className="p-8">
            {/* Dynamic step title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{getStepTitle()}</h2>
            {/* Render the current step's content */}
            {renderCurrentStep()}
          </div>

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="px-8 pb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Please correct the following errors:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(validationErrors).map(([key, error]) => (
                        <li key={key}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <h4 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h4>
              </div>
              <ul className="list-disc pl-6 space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Footer with navigation buttons */}
          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between border-t border-gray-100">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            {/* Next/Submit button */}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Quotes...
                </>
              ) : (
                <>
                  {/* Show different text on final step */}
                  {currentStep === totalSteps - 1 ? 'Submit' : 'Continue'}
                  {/* Show arrow icon only if not on final step and not loading */}
                  {currentStep < totalSteps - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}