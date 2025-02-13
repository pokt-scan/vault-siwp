// @ts-ignore
import apgLib from "apg-js/src/apg-lib/node-exports";
// @ts-ignore
import apgApi from "apg-js/src/apg-api/api";
import { isValidPocketAddress } from "./utils";

const GRAMMAR = `
sign-in-with-pocket =
    [ scheme "://" ] domain %s" wants you to sign in with your Pocket account:" LF
    address LF
    LF
    [ statement LF ]
    LF
    %s"URI: " URI LF
    %s"Version: " version LF
    %s"Chain ID: " chain-id LF
    %s"Nonce: " nonce LF
    %s"Issued At: " issued-at
    [ LF %s"Expiration Time: " expiration-time ]
    [ LF %s"Not Before: " not-before ]
    [ LF %s"Request ID: " request-id ]
    [ LF %s"Resources:"
    resources ]

domain = authority

address = base58-encoded
    ; The address should be a valid Pocket Network address,
    ; typically encoded in base58, which corresponds to an ed25519 public key.

statement = 1*( reserved / unreserved / " " )
    ; The purpose is to exclude LF (line breaks).

version = "1"

chain-id = "mainnet" / "testnet"
    ; Specifies whether the request is targeting the main network or the test network.

nonce = 8*( ALPHA / DIGIT )

issued-at = date-time
expiration-time = date-time
not-before = date-time

request-id = *pchar

resources = *( LF resource )

resource = "- " URI

; ------------------------------------------------------------------------------
; Base58 Encoding
base58-encoded = 1*( ALPHA / DIGIT / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" )
    ; Base58 encoding excludes the characters '0', 'O', 'I', and 'l' to avoid confusion.

; ------------------------------------------------------------------------------
; RFC 3986

URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

hier-part     = "//" authority path-abempty
              / path-absolute
              / path-rootless
              / path-empty

scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

authority     = [ userinfo "@" ] host [ ":" port ]
userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
host          = IP-literal / IPv4address / reg-name
port          = *DIGIT

IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

IPv6address   =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

h16           = 1*4HEXDIG
ls32          = ( h16 ":" h16 ) / IPv4address
IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
dec-octet     = DIGIT                 ; 0-9
                 / %x31-39 DIGIT         ; 10-99
                 / "1" 2DIGIT            ; 100-199
                 / "2" %x30-34 DIGIT     ; 200-249
                 / "25" %x30-35          ; 250-255

reg-name      = *( unreserved / pct-encoded / sub-delims )

path-abempty  = *( "/" segment )
path-absolute = "/" [ segment-nz *( "/" segment ) ]
path-rootless = segment-nz *( "/" segment )
path-empty    = 0pchar

segment       = *pchar
segment-nz    = 1*pchar

pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

query         = *( pchar / "/" / "?" )

fragment      = *( pchar / "/" / "?" )

pct-encoded   = "%" HEXDIG HEXDIG

unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
reserved      = gen-delims / sub-delims
gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="

; ------------------------------------------------------------------------------
; RFC 3339

date-fullyear   = 4DIGIT
date-month      = 2DIGIT  ; 01-12
date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
                          ; month/year
time-hour       = 2DIGIT  ; 00-23
time-minute     = 2DIGIT  ; 00-59
time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
                          ; rules
time-secfrac    = "." 1*DIGIT
time-numoffset  = ("+" / "-") time-hour ":" time-minute
time-offset     = "Z" / time-numoffset

partial-time    = time-hour ":" time-minute ":" time-second
                  [time-secfrac]
full-date       = date-fullyear "-" date-month "-" date-mday
full-time       = partial-time time-offset

date-time       = full-date "T" full-time

; ------------------------------------------------------------------------------
; RFC 5234

ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
LF             =  %x0A
                  ; linefeed
DIGIT          =  %x30-39
                  ; 0-9
HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
`;

class GrammarApi {
    static grammarObj = this.generateApi();

    static generateApi() {
        const api = new apgApi(GRAMMAR);
        api.generate();
        if (api.errors.length) {
            console.error(api.errorsToAscii());
            console.error(api.linesToAscii());
            console.log(api.displayAttributeErrors());
            throw new Error(`AB-NF grammar has errors`);
        }
        return api.toObject();
    }
}

const id = apgLib.ids;

const asString = (key: string) => {
    return (state: string, chars: any, phraseIndex: number, phraseLength: number, data: Record<string, any>) => {
        const ret = id.SEM_OK;
        if (state === id.SEM_PRE) {
            if (!data[key]) {
                data[key] = apgLib.utils.charsToString(
                    chars,
                    phraseIndex,
                    phraseLength
                );
            }
        }
        return ret;
    };
}

const domain = asString("domain");

const address = asString("address");

const statement = asString("statement");

const version = asString("version");

const chainId = asString("chainId");

const nonce = asString("nonce");

const issuedAt = asString("issuedAt");

const expirationTime = asString("expirationTime");

const notBefore = asString("notBefore");

const requestId = asString("requestId");

const uri = asString("uri");

const scheme = (state: string, chars: any, phraseIndex: number, phraseLength: number, data: Record<string, any>) => {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE && phraseIndex === 0) {
        data.scheme = apgLib.utils.charsToString(
            chars,
            phraseIndex,
            phraseLength
        );
    }
    return ret;
};

const resources = (state: string, chars: any, phraseIndex: number, phraseLength: number, data: Record<string, any>) => {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE) {
        data.resources = apgLib.utils
            .charsToString(chars, phraseIndex, phraseLength)
            .slice(3)
            .split("\n- ");
    }
    return ret;
};

export class ParsedMessage {
    [key: string]: any;
    scheme?: string;
    domain: string;
    address: string;
    statement?: string;
    uri: string;
    version: string;
    chainId: "mainnet" | "testnet";
    nonce: string;
    issuedAt: string;
    expirationTime?: string;
    notBefore?: string;
    requestId?: string;
    resources?: Array<string>;

    constructor(msg: string) {
        const parser = new apgLib.parser();

        parser.ast = new apgLib.ast();

        parser.ast.callbacks.scheme = scheme;
        parser.ast.callbacks.domain = domain;
        parser.ast.callbacks.address = address;
        parser.ast.callbacks.statement = statement;
        parser.ast.callbacks.uri = uri;
        parser.ast.callbacks.version = version;
        parser.ast.callbacks["chain-id"] = chainId;
        parser.ast.callbacks.nonce = nonce;
        parser.ast.callbacks["issued-at"] = issuedAt;
        parser.ast.callbacks["expiration-time"] = expirationTime;
        parser.ast.callbacks["not-before"] = notBefore;
        parser.ast.callbacks["request-id"] = requestId;
        parser.ast.callbacks.resources = resources;

        const result = parser.parse(GrammarApi.grammarObj, "sign-in-with-pocket", msg);

        if (!result.success) {
            throw new Error(`Invalid message: ${JSON.stringify(result)}`);
        }

        const elements: Record<string, any> = {};

        parser.ast.translate(elements);

        this.scheme = elements.scheme;
        this.domain = elements.domain;
        this.address = elements.address;
        this.statement = elements.statement;
        this.uri = elements.uri;
        this.version = elements.version;
        this.chainId = elements.chainId;
        this.nonce = elements.nonce;
        this.issuedAt = elements.issuedAt;
        this.expirationTime = elements.expirationTime;
        this.notBefore = elements.notBefore;
        this.requestId = elements.requestId;
        this.resources = elements.resources;


        if (this.domain.length === 0) {
            throw new Error("Domain cannot be empty.");
        }

        if (!isValidPocketAddress(this.address)) {
            throw new Error("Address is not a valid Pocket Network address.");
        }
    }
}
