export type FormulaType = "fixed" | "percentage" | "formula";

export interface FormulaField {
  type: FormulaType;
  value?: number;
  expression?: string;
}

export type FormulaJson = Record<string, FormulaField>;

export interface CalculationResult {
  amount: number;
  customer_fee: number;
  bri_fee: number;
  agent_profit: number;
  total_paid: number;
  [key: string]: number; // Allow any other calculated fields
}

/**
 * Safely evaluates a simple arithmetic expression involving addition, subtraction, multiplication, and division.
 * This is a basic parser that avoids using eval() for security reasons.
 * Supported operators: +, -, *, /
 * Supported tokens: numbers, variable names present in the context
 */
export function safeEvaluate( expression: string, context: Record<string, number> ): number {
  // Remove all whitespace
  const expr = expression.replace( /\s+/g, '' );

  // Split into tokens (numbers, variables, operators)
  const tokens = expr.split( /([+\-*/()])/ ).filter( t => t.length > 0 );

  // Replace variables with their numeric values
  const numericTokens = tokens.map( token => {
    if ( ['+', '-', '*', '/', '(', ')'].includes( token ) ) {
      return token;
    }
    if ( context[token] !== undefined ) {
      return context[token].toString();
    }
    if ( !isNaN( Number( token ) ) ) {
      return token;
    }
    throw new Error( `Unknown variable or invalid token in formula: ${token}` );
  } );

  // Basic infix to postfix (Shunting-yard algorithm) and postfix evaluation
  // For simplicity since we only have basic operators without parens in our examples,
  // we can use a simpler approach or a basic recursive descent parser.
  // Given MVP constraints, we will parse left-to-right with basic operator precedence (*, / then +, -).
  // NOTE: This implementation assumes valid format and doesn't handle complex parentheses.
  
  // Actually, an even simpler approach without eval is using the Function constructor with restricted scope,
  // but since we want to STRICTLY avoid eval-like functions:
  return evaluateExpressionList( numericTokens );
}

// Simple expression evaluator
function evaluateExpressionList( tokens: string[] ): number {
  // Handle multiplication and division first
  for ( let i = 0; i < tokens.length; i++ ) {
    if ( tokens[i] === '*' || tokens[i] === '/' ) {
      const left = Number( tokens[i - 1] );
      const right = Number( tokens[i + 1] );
      const result = tokens[i] === '*' ? left * right : left / right;
      tokens.splice( i - 1, 3, result.toString() );
      i -= 1; // Adjust index after splice
    }
  }

  // Handle addition and subtraction
  let result = Number( tokens[0] );
  for ( let i = 1; i < tokens.length; i += 2 ) {
    const operator = tokens[i];
    const right = Number( tokens[i + 1] );
    if ( operator === '+' ) {
      result += right;
    } else if ( operator === '-' ) {
      result -= right;
    }
  }

  return result;
}

export function calculateTransaction( amount: number, formulaJson: FormulaJson ): CalculationResult {
  const context: Record<string, number> = { amount };
  const result: CalculationResult = {
    amount,
    customer_fee : 0,
    bri_fee      : 0,
    agent_profit : 0,
    total_paid   : amount
  };

  // We need to resolve fields in order. Formula fields might depend on each other.
  // To handle dependencies, we iterate until all fields are resolved, or we hit a limit (circular dependency).
  
  const unresolved = new Set( Object.keys( formulaJson ) );
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while ( unresolved.size > 0 && iterations < MAX_ITERATIONS ) {
    let resolvedInThisIteration = 0;

    for ( const key of Array.from( unresolved ) ) {
      const field = formulaJson[key];
      let value: number | null = null;

      if ( field.type === "fixed" && field.value !== undefined ) {
        value = field.value;
      } else if ( field.type === "percentage" && field.value !== undefined ) {
        value = ( amount * field.value ) / 100;
      } else if ( field.type === "formula" && field.expression ) {
        try {
          value = safeEvaluate( field.expression, context );
        } catch ( e ) {
          // If variables are missing, it throws. We'll wait for the next iteration.
          value = null; 
        }
      }

      if ( value !== null ) {
        context[key] = value;
        ( result as any )[key] = value;
        unresolved.delete( key );
        resolvedInThisIteration++;
      }
    }

    if ( resolvedInThisIteration === 0 ) {
      throw new Error( "Could not resolve all fields. Check for circular dependencies or missing variables." );
    }
    iterations++;
  }

  // Set default missing values to 0
  if ( !result.customer_fee ) result.customer_fee = 0;
  if ( !result.bri_fee ) result.bri_fee = 0;
  if ( !result.agent_profit ) result.agent_profit = 0;
  if ( !result.total_paid ) result.total_paid = amount + result.customer_fee;

  return result;
}
