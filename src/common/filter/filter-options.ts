export type FilterOrderDirection = 'asc' | 'desc';

export type FilterWhereOp =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'contains';

export type FilterPrimitive = string | number | boolean | null;

export type FilterCondition =
  | FilterPrimitive
  | {
      op: FilterWhereOp;
      value: FilterPrimitive | FilterPrimitive[];
    };

export type FilterWhere<TEntity extends object> = Partial<
  Record<keyof TEntity & string, FilterCondition>
>;

export type FilterSelect<TEntity extends object> = Array<keyof TEntity & string>;

export type FilterOrder<TEntity extends object> = Array<{
  field: keyof TEntity & string;
  direction?: FilterOrderDirection;
}>;

export interface FilterOptionsInit<TEntity extends object> {
  where?: FilterWhere<TEntity>;
  select?: FilterSelect<TEntity>;
  order?: FilterOrder<TEntity>;
  relations?: string[];
  limit?: number;
  offset?: number;
}

export class FilterOptions<Model extends object = any> {
  where?: FilterWhere<Model>;
  select?: FilterSelect<Model>;
  order?: FilterOrder<Model>;
  relations?: string[];
  limit?: number;
  offset?: number;

  constructor(init: FilterOptionsInit<Model> = {}) {
    Object.assign(this, init);
  }
}

