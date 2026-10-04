/**
 * Template Engine for Glitch Hunter
 * Evaluates template expressions formatted as `<<<${expression}>>>`
 * using the provided context object: e.g. { data: { incidentId: '...' } }
 */

export function renderTemplate(template: string, context: Record<string, any> = {}): string {
  // Matches both `<<<${expr}>>>` and <<<${expr}>>>
  const pattern = /(?:`<<<|<<<)\$\{([\s\S]+?)\}(?:>>>`|>>>)/g;

  return template.replace(pattern, (_, expression) => {
    try {
      const keys = Object.keys(context);
      const values = Object.values(context);
      // Safe scoped evaluation of the expression with context variables injected
      const fn = new Function(...keys, `return (${expression.trim()});`);
      const evaluated = fn(...values);
      return evaluated !== undefined && evaluated !== null ? String(evaluated) : '';
    } catch (err) {
      console.warn(`[TemplateEngine] Error evaluating expression "${expression}":`, err);
      return '';
    }
  });
}
