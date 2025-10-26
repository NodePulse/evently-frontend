// components/EventDetails.tsx
import React from "react";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";

interface EventDetailsProps {
  htmlContent: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({ htmlContent }) => {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        const { name, children } = domNode;

        switch (name) {
          case "h3":
            return (
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-indigo-700">
                {domToReact(children, options)}
              </h3>
            );
          case "p":
            return (
              <p className="mb-4 text-gray-800 leading-relaxed text-base md:text-lg">
                {domToReact(children, options)}
              </p>
            );
          case "ol":
            return <ol className="list-decimal ml-6 mb-4">{domToReact(children, options)}</ol>;
          case "li":
            return <li className="mb-2 text-gray-700">{domToReact(children, options)}</li>;
          case "strong":
            return <strong className="font-semibold text-indigo-600">{domToReact(children, options)}</strong>;
          case "em":
            return <em className="italic text-gray-600">{domToReact(children, options)}</em>;
          default:
            return undefined;
        }
      }
    },
  };

  return <div className="prose prose-lg max-w-none text-gray-800 space-y-3">{parse(htmlContent, options)}</div>;
};

export default EventDetails;
