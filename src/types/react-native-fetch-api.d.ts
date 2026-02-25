declare module 'react-native-fetch-api' {
  interface ReactNativeFetchInit extends RequestInit {
    reactNative?: {
      textStreaming?: boolean;
    };
  }

  export function fetch(
    input: RequestInfo | URL,
    init?: ReactNativeFetchInit
  ): Promise<Response>;
}
