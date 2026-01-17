import React from 'react';
import { Plus, Trash, CaretDown, CaretRight, Gear } from 'phosphor-react';
import { useUIStore } from '../../../store/uiStore';

export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';

export interface SchemaNodeProps {
  name: string;
  schema: any;
  onChange: (newSchema: any) => void;
  onDelete?: () => void;
  isRoot?: boolean;
  required?: boolean;
  onToggleRequired?: (required: boolean) => void;
}

export default function SchemaNode({
  name,
  schema,
  onChange,
  onDelete,
  isRoot = false,
  required = false,
  onToggleRequired
}: SchemaNodeProps) {
  const darkMode = useUIStore((state) => state.darkMode);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [localName, setLocalName] = React.useState(name);

  // Sync local name when prop changes (e.g. from code editor or external load)
  React.useEffect(() => {
    setLocalName(name);
  }, [name]);

  if (!schema) {
    return null;
  }

  const type = schema.type || 'string';

  const handleTypeChange = (newType: JSONSchemaType) => {
    const newSchema = { ...schema, type: newType };
    
    // Cleanup old type-specific fields
    if (newType !== 'object') {
      delete newSchema.properties;
      delete newSchema.required;
    } else {
      newSchema.properties = newSchema.properties || {};
      newSchema.required = newSchema.required || [];
    }

    if (newType !== 'array') {
      delete newSchema.items;
    } else {
      newSchema.items = newSchema.items || { type: 'string' };
    }

    onChange(newSchema);
  };

  const updateProperty = (propName: string, propSchema: any) => {
    const newProperties = { ...(schema.properties || {}), [propName]: propSchema };
    onChange({ ...schema, properties: newProperties });
  };

  const deleteProperty = (propName: string) => {
    const newProperties = { ...(schema.properties || {}) };
    delete newProperties[propName];
    
    const newRequired = (schema.required || []).filter((r: string) => r !== propName);
    onChange({ ...schema, properties: newProperties, required: newRequired });
  };

  const addProperty = () => {
    let baseName = "new_property";
    let counter = 1;
    const properties = schema.properties || {};
    while (properties[counter === 1 ? baseName : `${baseName}_${counter}`]) {
      counter++;
    }
    const finalName = counter === 1 ? baseName : `${baseName}_${counter}`;
    
    const newProperties = { 
      ...properties, 
      [finalName]: { type: 'string' } 
    };
    onChange({ ...schema, properties: newProperties });
  };

  const renameProperty = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    if (!newName.trim()) {
      setLocalName(oldName);
      return;
    }
    
    const properties = schema.properties || {};
    const newProperties = { ...properties };
    
    // Prevent overwriting existing properties
    if (newProperties[newName]) {
      setLocalName(oldName);
      return;
    }

    newProperties[newName] = newProperties[oldName];
    delete newProperties[oldName];

    let newRequired = [...(schema.required || [])];
    if (newRequired.includes(oldName)) {
      newRequired = newRequired.map(r => r === oldName ? newName : r);
    }

    onChange({ ...schema, properties: newProperties, required: newRequired });
  };

  const toggleRequired = (propName: string) => {
    let newRequired = [...(schema.required || [])];
    if (newRequired.includes(propName)) {
      newRequired = newRequired.filter(r => r !== propName);
    } else {
      newRequired.push(propName);
    }
    onChange({ ...schema, required: newRequired });
  };

  const updateConstraint = (key: string, value: any) => {
    const newSchema = { ...schema };
    if (value === '' || value === undefined || value === null) {
      delete newSchema[key];
    } else {
      newSchema[key] = value;
    }
    onChange(newSchema);
  };

  return (
    <div className={`mt-2 ${!isRoot ? 'ml-4 border-l-2 pl-4' : ''} ${
      darkMode ? 'border-zinc-800' : 'border-zinc-200'
    }`}>
      <div className="flex flex-wrap items-center gap-2 group">
        {/* Toggle Collapse for Objects/Arrays */}
        {(type === 'object' || type === 'array') && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
              darkMode ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            {isCollapsed ? <CaretRight size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
          </button>
        )}

        {/* Property Name */}
        {!isRoot ? (
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => renameProperty(name, localName)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                renameProperty(name, localName);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={`text-xs font-mono font-bold bg-transparent border-b border-transparent focus:border-zinc-400 focus:outline-none py-1 w-32 ${
              darkMode ? 'text-zinc-300' : 'text-zinc-700'
            }`}
          />
        ) : (
          <span className={`text-xs font-bold uppercase tracking-widest ${
            darkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>root</span>
        )}

        {/* Type Selector */}
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as JSONSchemaType)}
          className={`text-[10px] font-bold uppercase p-1 rounded border appearance-none cursor-pointer ${
            darkMode 
              ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200' 
              : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="integer">Integer</option>
          <option value="boolean">Boolean</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
        </select>

        {/* Required Toggle (for object properties) */}
        {!isRoot && onToggleRequired && (
          <button
            onClick={() => onToggleRequired(!required)}
            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded transition-colors ${
              required
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'text-zinc-400 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            title="Mark as required"
          >
            Req
          </button>
        )}

        {/* Advanced Settings Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
            showAdvanced 
              ? (darkMode ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-900 bg-zinc-100')
              : (darkMode ? 'text-zinc-500' : 'text-zinc-400')
          }`}
        >
          <Gear size={14} weight={showAdvanced ? "fill" : "bold"} />
        </button>

        {/* Delete Button */}
        {!isRoot && onDelete && (
          <button
            onClick={onDelete}
            className={`p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all ${
              darkMode ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            <Trash size={14} />
          </button>
        )}
      </div>

      {/* Advanced Constraints */}
      {showAdvanced && (
        <div className={`mt-2 p-3 rounded-lg border flex flex-wrap gap-4 text-[10px] ${
          darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
        }`}>
          {/* Common */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-zinc-500 uppercase">Description</label>
            <input
              type="text"
              placeholder="e.g. The user's full name"
              value={schema.description || ''}
              onChange={(e) => updateConstraint('description', e.target.value)}
              className={`bg-transparent border-b border-zinc-700 focus:outline-none w-48 ${
                darkMode ? 'text-zinc-300' : 'text-zinc-700'
              }`}
            />
          </div>

          {/* String specific */}
          {type === 'string' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Enum (comma-sep)</label>
                <input
                  type="text"
                  placeholder="red, green, blue"
                  value={schema.enum ? schema.enum.join(', ') : ''}
                  onChange={(e) => updateConstraint('enum', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-32 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Min Length</label>
                <input
                  type="number"
                  value={schema.minLength ?? ''}
                  onChange={(e) => updateConstraint('minLength', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Max Length</label>
                <input
                  type="number"
                  value={schema.maxLength ?? ''}
                  onChange={(e) => updateConstraint('maxLength', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
            </>
          )}

          {/* Number specific */}
          {(type === 'number' || type === 'integer') && (
            <>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Min</label>
                <input
                  type="number"
                  value={schema.minimum ?? ''}
                  onChange={(e) => updateConstraint('minimum', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Max</label>
                <input
                  type="number"
                  value={schema.maximum ?? ''}
                  onChange={(e) => updateConstraint('maximum', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
            </>
          )}

          {/* Array specific */}
          {type === 'array' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Min Items</label>
                <input
                  type="number"
                  value={schema.minItems ?? ''}
                  onChange={(e) => updateConstraint('minItems', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500 uppercase">Max Items</label>
                <input
                  type="number"
                  value={schema.maxItems ?? ''}
                  onChange={(e) => updateConstraint('maxItems', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  className={`bg-transparent border-b border-zinc-700 focus:outline-none w-16 ${
                    darkMode ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Children */}
      {!isCollapsed && (
        <div className="mt-2">
          {type === 'object' && (
            <div className="space-y-1">
              {Object.entries(schema.properties || {}).map(([propName, propSchema]: [string, any]) => (
                <SchemaNode
                  key={propName}
                  name={propName}
                  schema={propSchema}
                  onChange={(newPropSchema) => updateProperty(propName, newPropSchema)}
                  onDelete={() => deleteProperty(propName)}
                  required={schema.required?.includes(propName)}
                  onToggleRequired={() => toggleRequired(propName)}
                />
              ))}
              <button
                onClick={addProperty}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all mt-4 ${
                  darkMode 
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700' 
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200'
                }`}
              >
                <Plus size={12} weight="bold" />
                Add Property
              </button>
            </div>
          )}

          {type === 'array' && (
            <div className="mt-2">
              <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                darkMode ? 'text-zinc-600' : 'text-zinc-400'
              }`}>Items Template</div>
              <SchemaNode
                name="item"
                schema={schema.items || { type: 'string' }}
                onChange={(newItemsSchema) => onChange({ ...schema, items: newItemsSchema })}
                isRoot={false} // items in array are not named in JSON schema but for GUI we show "item"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
