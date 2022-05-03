const regex = {
    // Just a test regex (minimum 3 & maximum 10 characters, no whitespaces):
    regex0: /^.[^\s]{2,10}$/,

    // Minimum eight characters, at least one letter, one number and one special character:
    regex1: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%|*?&+-])[A-Za-z\d@$!%|*?&+-]{8,}$/,

    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    regex2: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%|*?&+-])[A-Za-z\d@$!%|*?&+-]{8,}$/,

    // Minimum minimum 12 characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    regex3: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%|*?&+-])[A-Za-z\d@$!%|*?&+-]{12,}$/,

    // Minimum 16 characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    regex4: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%|*?&+-])[A-Za-z\d@$!%|*?&+-]{16,}$/
}

