export interface code {
    codeString: `OPSucess` | `OPFailed` | `MissingRequiredField` | `NotFound` | `ISE` | `InputVFailed` | `AlreadyExist`
}

export function ReturnCode(codeString: code['codeString']) {

    switch (codeString) {
        case `OPSucess`:
            return 0;
        case `MissingRequiredField`:
            return -101;
        case `ISE`:
            return -110;
        case `InputVFailed`:
            return -102;
        case `OPFailed`:
            return -103;
        case `NotFound`:
            return -104;
        case `AlreadyExist`:
            return -105;
    }

}