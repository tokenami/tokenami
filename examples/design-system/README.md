# @tokenami/example-design-system

An example design system built with Tokenami.

Preview: [tokenami-design-system.vercel.app](https://tokenami-design-system.vercel.app)

This project demonstrates how to package reusable Tokenami configuration, generated CSS,
and framework-agnostic React components so they can be consumed by another project. The
[Next.js example](../nextjs/) uses this package as its design system instead of defining
its own generic UI primitives.

It includes:

- A shared Tokenami config exported from `@tokenami/example-design-system/config`.
- Shared font loading exported as `@tokenami/example-design-system/font.css`.
- Generated design-system CSS exported as `@tokenami/example-design-system/tokenami.css`.
- Reusable components exported from `@tokenami/example-design-system`, including client components.
- [StoryLite](https://github.com/itsjavi/storylite) stories for the component library.

The Next.js example consumes the design system by importing the config in its Tokenami
config, and importing components from this package in app code.
