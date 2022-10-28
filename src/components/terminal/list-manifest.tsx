import { useQuery } from "@tanstack/react-query";
import { Service, ServiceConfig } from "@theprelude/sdk";
import React, { useState } from "react";
import { useEffect, useRef } from "react";
import useAuthStore from "../../hooks/auth-store";
import styles from "./commands.module.css";
import { z } from "zod";
import useEditorStore from "../../hooks/editor-store";
import shallow from "zustand/shallow";
import useNavigationStore from "../../hooks/navigation-store";
import useTerminalStore from "../../hooks/terminal-store";

const getManifest = async (config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.listManifest();
};

const getTTP = async (id: string, config: ServiceConfig) => {
  const service = new Service(config);
  return service.build.getTTP(id);
};

interface TTP {
  id: string;
  question: string;
}

const ListManifest: React.FC<{ unlock: (s: string) => void }> = ({
  unlock,
}) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [selectedTTP, setSelectedTTP] = useState<TTP | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const openTab = useEditorStore((state) => state.openTab);
  const navigate = useNavigationStore((state) => state.navigate);
  const clear = useTerminalStore((state) => state.clear);
  const config = useAuthStore(
    (state) => ({
      host: state.host,
      credentials: state.credentials,
    }),
    shallow
  );

  if (file && selectedTTP) {
    return (
      <div className={styles.manifest}>
        <div>
          <p>
            TTP: {selectedTTP.question} - {selectedTTP.id}
          </p>
          <p>File: {file}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.manifest}>
      {!selectedTTP ? (
        <SelectManifest
          pickerRef={pickerRef}
          onSelect={(ttp) => setSelectedTTP(ttp)}
        />
      ) : (
        <SelectCodeFile
          onSelect={async (file) => {
            const service = new Service(config);
            const code = await service.build.getCodeFile(file, {
              headers: { ...config.credentials },
            });

            setFile(file);
            navigate("editor");
            openTab({ name: file, code });
            unlock(`opening ${file} in editor`);
          }}
          pickerRef={pickerRef}
          ttp={selectedTTP}
        />
      )}
    </div>
  );
};

const SelectManifest: React.FC<{
  pickerRef: React.RefObject<HTMLInputElement>;
  onSelect: (ttp: TTP) => void;
}> = ({ onSelect, pickerRef }) => {
  const config = useAuthStore((state) => ({
    host: state.host,
    credentials: state.credentials,
  }));

  const manifest = useQuery(["list-manfiest"], () => getManifest(config), {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const ttps = manifest.data ?? {};
  const ttpKeys = Object.keys(ttps);
  const max = ttpKeys.length;

  useEffect(() => {
    pickerRef.current?.focus();
  }, [pickerRef.current, max]);

  if (manifest.isFetching) {
    return null;
  }

  return (
    <>
      <div>
        <strong>Manifest</strong>
        <ol>
          {ttpKeys.map((ttpId) => {
            return (
              <li key={ttpId}>
                <span>{ttps[ttpId]}</span> - <span>{ttpId}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <span>
          Type the number and hit <strong>Enter</strong> to select (1-{max})
        </span>{" "}
        <PickerInput
          onPick={(index) => {
            onSelect({ id: ttpKeys[index], question: ttps[ttpKeys[index]] });
          }}
          ref={pickerRef}
          max={max}
        />
      </div>
    </>
  );
};

const PickerInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    max: number;
    onPick: (index: number) => void;
  }
>((props, ref) => {
  const [value, setValue] = useState<number | null>(null);
  const { max, onPick, ...rest } = props;

  return (
    <input
      {...rest}
      ref={ref}
      type="number"
      min="1"
      maxLength={2}
      value={value ?? ""}
      onKeyDown={(e) => {
        if (e.key === "e") {
          e.preventDefault();
          return false;
        }

        if (e.key === "Enter" && value !== null) {
          e.preventDefault();
          onPick(value - 1);
        }

        return true;
      }}
      onChange={(e) => {
        try {
          if (e.target.value === "") {
            setValue(null);
            return;
          }
          const val = z
            .number()
            .min(1)
            .max(max)
            .parse(parseInt(e.target.value, 10));

          setValue(val);
        } catch (e) {}
      }}
    />
  );
});

const SelectCodeFile: React.FC<{
  ttp: TTP;
  pickerRef: React.RefObject<HTMLInputElement>;
  onSelect: (file: string) => void;
}> = ({ ttp, pickerRef, onSelect }) => {
  const config = useAuthStore((state) => ({
    host: state.host,
    credentials: state.credentials,
  }));

  const ttpFiles = useQuery(["get-ttp", ttp.id], () => getTTP(ttp.id, config), {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const files = ttpFiles.data ?? [];

  useEffect(() => {
    pickerRef.current?.focus();
  }, [pickerRef.current, files.length]);

  if (ttpFiles.isFetching) {
    return null;
  }

  return (
    <>
      <div>
        <span>
          Code files for{" "}
          <strong>
            {ttp.question} - {ttp.id}
          </strong>
        </span>
        <ol>
          {files.map((file) => {
            return (
              <li key={file}>
                <span>{file}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <span>
          Type the number and hit <strong>Enter</strong> to open file (1-
          {files.length})
        </span>{" "}
        <PickerInput
          onPick={(index) => {
            const file = files[index];
            onSelect(file);
          }}
          ref={pickerRef}
          max={files.length}
        />
      </div>
    </>
  );
};
export default React.memo(ListManifest);
