declare namespace NodeJS { //pretty cool, for auto-complete command is: npx gen-env-types .env -o [RELATIVE-PATH] -e .
  export interface ProcessEnv {
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    ACCESS_TOKEN_SECRET: string;
  }
}
