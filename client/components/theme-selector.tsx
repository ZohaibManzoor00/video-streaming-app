"use client";
import Dropdown from "./drop-down";
import { useTheme } from "@/context/themeContext";
import { upperCaseFirstChar } from "@/lib/utils";

const colors = ["slate", "green", "yellow", "orange", "pink", "blue"];

export default function ThemeSelector() {
  const { setPrimary, setSecondary, secondary, primary } = useTheme();

  return (
    <>
      <Dropdown>
        <div className="flex gap-x-2">
          <div>
            <h3 className="text-center">Primary</h3>
            <ul>
              {colors.map((color) => (
                <li key={color} className="mt-2">
                  <button onClick={() => setPrimary(color)}>
                    <div
                      className={`flex border-2 rounded-md border-opacity-35 min-w-28 p-1`}
                    >
                      {color === primary ? (
                        <div className="h-6 w-6 ml-1"> {"✓"}</div>
                      ) : (
                        <div
                          className={`bg-primary-${color} h-6 w-6 rounded-full ml-1`}
                        />
                      )}
                      <p className="pl-2">{upperCaseFirstChar(color)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-center">Secondary</h3>
            <ul>
              {colors.map((color) => (
                <li key={color} className="mt-2">
                  <button onClick={() => setSecondary(color)}>
                    <div
                      className={`flex border-2 rounded-md border-opacity-35 min-w-28 p-1`}
                    >
                      {color === secondary ? (
                        <div className="h-6 w-6 ml-1"> {"✓"}</div>
                      ) : (
                        <div
                          className={`bg-secondary-${color} h-6 w-6 rounded-full ml-1`}
                        />
                      )}
                      <p className="pl-2">{upperCaseFirstChar(color)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Dropdown>
    </>
  );
}
