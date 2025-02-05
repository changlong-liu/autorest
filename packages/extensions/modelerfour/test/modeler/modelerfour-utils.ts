import assert from "assert";
import { CodeModel, Operation } from "@autorest/codemodel";
import oai3, { Model } from "@azure-tools/openapi";
import { ModelerFourOptions } from "modeler/modelerfour-options";
import { ModelerFour } from "../../src/modeler/modelerfour";
import { addOperation, createTestSessionFromModel, createTestSpec } from "../utils";

const modelerfourOptions: ModelerFourOptions = {
  "flatten-models": true,
  "flatten-payloads": true,
  "group-parameters": true,
  "resolve-schema-name-collisons": true,
  "additional-checks": true,
  "always-create-accept-parameter": true,
  //'always-create-content-type-parameter': true,
  naming: {
    override: {
      $host: "$host",
      cmyk: "CMYK",
    },
    local: "_ + camel",
    constantParameter: "pascal",
  },
};

const cfg = {
  modelerfour: modelerfourOptions,
  "payload-flattening-threshold": 2,
};

export async function runModeler(spec: any, config: { modelerfour: ModelerFourOptions } = cfg): Promise<CodeModel> {
  const { session, errors } = await createTestSessionFromModel<Model>(config, spec);
  const modeler = await new ModelerFour(session).init();

  expect(errors.length).toBe(0);

  return modeler.process();
}

export async function runModelerWithOperation(
  method: string,
  path: string,
  operation: oai3.HttpOperation,
): Promise<Operation> {
  const spec = createTestSpec();

  addOperation(spec, path, {
    [method]: operation,
  });

  const codeModel = await runModeler(spec);
  const m4Operation = codeModel.operationGroups[0]?.operations[0];
  assert(m4Operation);
  return m4Operation;
}
