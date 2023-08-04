export declare const numberOrExpressionRegex = "^(\\d+\\.?\\d*|{{.*}})$";
export declare const notEmptyRegex = "(.|\\s)*\\S(.|\\s)*";
/**
 * Get base classes of components
 *
 * @export
 * @param {any} targetClass
 * @returns {string[]}
 */
export declare const getBaseClasses: (targetClass: any) => string[];
/**
 * Serialize axios query params
 *
 * @export
 * @param {any} params
 * @param {boolean} skipIndex // Set to true if you want same params to be: param=1&param=2 instead of: param[0]=1&param[1]=2
 * @returns {string}
 */
export declare function serializeQueryParams(params: any, skipIndex?: boolean): string;
/**
 * Handle error from try catch
 *
 * @export
 * @param {any} error
 * @returns {string}
 */
export declare function handleErrorMessage(error: any): string;
/**
 * Returns the path of node modules package
 * @param {string} packageName
 * @returns {string}
 */
export declare const getNodeModulesPackagePath: (packageName: string) => string;
/**
 * Get input variables
 * @param {string} paramValue
 * @returns {boolean}
 */
export declare const getInputVariables: (paramValue: string) => string[];
/**
 * Crawl all available urls given a domain url and limit
 * @param {string} url
 * @param {number} limit
 * @returns {string[]}
 */
export declare const getAvailableURLs: (url: string, limit: number) => Promise<string[]>;
/**
 * Prep URL before passing into recursive carwl function
 */
export declare function webCrawl(stringURL: string, limit: number): Promise<string[]>;
export declare function getURLsFromXML(xmlBody: string, limit: number): string[];
export declare function xmlScrape(currentURL: string, limit: number): Promise<string[]>;
export declare const getEnvironmentVariable: (name: string) => string | undefined;
export declare function handleEscapeCharacters(input: any, reverse: Boolean): any;
export declare const availableDependencies: string[];
export declare const getUserHome: () => string;
