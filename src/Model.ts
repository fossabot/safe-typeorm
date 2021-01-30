import * as orm from "typeorm";

import * as functional from "./functional";
import { EncryptedColumn } from "./decorators/EncryptedColumn";
import { JoinQueryBuilder } from "./JoinQueryBuilder";

import { CreatorType as _CreatorType } from "./typings/CreatorType";
import { FieldType } from "./typings/FieldType";
import { FieldValueType } from "./typings/FieldValueType";
import { OmitNever } from "./typings/OmitNever";
import { OperatorType } from "./typings/OperatorType";
import { SpecialFields } from "./typings/SpecialFields";
import { Has } from "./decorators/Has";

/**
 * The basic model class.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export abstract class Model extends orm.BaseEntity
{
    /* -----------------------------------------------------------
        CONSTRUCTORS
    ----------------------------------------------------------- */
    /**
     * Create join query builder.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @param closure A callback function who can join related tables very easily and safely
     * @return The newly created `TyperORM.SelectQueryBuilder` instance
     */
    public static createJoinQueryBuilder<T extends Model>
        (
            this: Model.CreatorType<T>, 
            closure: (builder: JoinQueryBuilder<T>) => void
        ): orm.SelectQueryBuilder<T>;

    /**
     * Create join query builder with alias.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @param alias Alias for the table
     * @param closure A callback function who can join related tables very easily and safely
     * @return The newly created `TyperORM.SelectQueryBuilder` instance
     */
    public static createJoinQueryBuilder<T extends Model>
        (
            this: Model.CreatorType<T>, 
            alias: string,
            closure: (builder: JoinQueryBuilder<T>) => void
        ): orm.SelectQueryBuilder<T>

    public static createJoinQueryBuilder<T extends Model>
        (
            this: Model.CreatorType<T>, 
            ...args: any[]
        ): orm.SelectQueryBuilder<T>
    {
        return functional.createJoinQueryBuilder(this, ...(args as [string, (builder: JoinQueryBuilder<T>) => void]));
    }

    /**
     * Update current entity data to the database.
     * 
     * If the primary key field is not a type of the {@link PrimaryGeneratedColumn}, `TypeORM` 
     * can't distinguish whether a {@link Model} instance is newly created or updated from 
     * ordinary. 
     * 
     * Therefore, when you call the {@link save} method in a {@link Model} instance whose primary 
     * key field a type of is not {@link PrimaryGeneratedColumn}, the `TypeORM` always execute the 
     * `INSERT` query instead of the `UPDATE` statement.
     * 
     * In such reason, when type of a primary is not the {@link PrimaryGeneratedColumn}, you have 
     * to distinguish `INSERT` and `UPDATE` queries by calling one of the {@link save} and 
     * {@link update} method by yourself.
     */
    public async update(): Promise<void>
    {
        const columnList = orm.getRepository(this.constructor).metadata.columns;
        const props: any = {};
        
        for (const column of columnList)
        {
            const key: string = column.propertyName;
            props[key] = (this as any)[key];
        }

        const field: string = Has.getPrimaryField(`${this.constructor.name}.update`, this.constructor as any);
        await orm.getRepository(this.constructor).update((this as any)[field], props);
    }

    /* -----------------------------------------------------------
        SPECIALIZATIONS
    ----------------------------------------------------------- */
    /**
     * Get column name.
     * 
     * `Model.getColumn()` is a static method returning the column name. 
     * 
     * Unlike writing the column name by yourself manually who can result in the critical runtime 
     * error by a typing error, the `Model.getColumn()` can detect the typing error in the compile
     * level. 
     * 
     * The `Model.getColumn()` even supports the table alias, therefore the table alias addicted 
     * column name also can take advantage of the compile time validation. In such reason, if you 
     * don't ignore error message from the TypeScript compiler, there can't be any runtime error 
     * that is caused by the mis-typing error in the SQL column specification level.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @template Field Type of a literal who represents the field that is defined in the *T* model
     * @param fieldLike Name of the target field in the model class. The field name can contain
     *                  the table alias.
     * @param alias Alias of the target column
     * @return The exact column name who never can be the runtime error
     */
    public static getColumn<T extends Model, Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>, 
            fieldLike: `${Field}` | `${string}.${Field}`,
            alias?: string
        ): string
    {
        return functional.getColumn<T, Field>(this, fieldLike, alias);
    }

    /**
     * Get arguments for the where-equal query.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @template Field Type of a literal who represents the field that is defined in the *T* model
     * @param fieldLike Name of the target field in the model class. The field name can contain
     *                  the table alias.
     * @param param A parameter for the where-equal query
     * @return The exact arguments, for the `TypeORM.SelectQueryBuilder.where()` like methods,
     *         which never can be the runtime error
     */
    public static getWhereArguments<T extends Model, Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>,
            fieldLike: `${Field}` | `${string}.${Field}`,
            param: FieldValueType<T[Field]>
        ): [string, { [key: string]: FieldValueType<T[Field]> }];

    /**
     * Get arguments for the where query.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @template Field Type of a literal who represents the field that is defined in the *T* model
     * @param fieldLike Name of the target field in the model class. The field name can contain
     *                  the table alias.
     * @param operator Operator for the where condition
     * @param param A parameter for the where query
     * @return The exact arguments, for the `TypeORM.SelectQueryBuilder.where()` like methods,
     *         which never can be the runtime error
     */
    public static getWhereArguments<T extends Model, Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>,
            fieldLike: `${Field}` | `${string}.${Field}`,
            operator: OperatorType,
            param: FieldValueType<T[Field]>
        ): [string, { [key: string]: FieldValueType<T[Field]> }];

    /**
     * Get arguments for the where-in query.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @template Field Type of a literal who represents the field that is defined in the *T* model
     * @param fieldLike Name of the target field in the model class. The field name can contain
     *                  the table alias.
     * @param operator Operator "BETWEEN" for the where condition
     * @param parameters Parameters for the where-in query
     */
    public static getWhereArguments<
            T extends Model, 
            Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>,
            fieldLike: `${Field}` | `${string}.${Field}`,
            operator: "IN",
            parameters: Array<FieldValueType<T[Field]>>,
        ): [string, { [key: string]: Array<FieldValueType<T[Field]>> }];
    
    /**
     * Get arguments for the where-between query.
     * 
     * @template T Type of a model class that is derived from the `Model`
     * @template Field Type of a literal who represents the field that is defined in the *T* model
     * @param fieldLike Name of the target field in the model class. The field name can contain
     *                  the table alias.
     * @param operator Operator "BETWEEN" for the where condition
     * @param minimum Minimum parameter of the between range
     * @param maximum Maximum parameter of the between range
     * @return The exact arguments, for the `TypeORM.SelectQueryBuilder.where()` like methods,
     *         which never can be the runtime error
     */
    public static getWhereArguments<
            T extends Model, 
            Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>,
            fieldLike: `${Field}` | `${string}.${Field}`,
            operator: "BETWEEN",
            minimum: FieldValueType<T[Field]>,
            maximum: FieldValueType<T[Field]>
        ): [string, { [key: string]: Array<FieldValueType<T[Field]>> }];

    public static getWhereArguments<T extends Model, Field extends SpecialFields<T, FieldType>>
        (
            this: Model.CreatorType<T>,
            fieldLike: `${Field}` | `${string}.${Field}`,
            ...rest: any[]
        ): [string, any]
    {
        return functional.getWhereArguments(this, fieldLike, ...(rest as [ OperatorType, FieldValueType<T[Field]> ]));
    }

    /* -----------------------------------------------------------
        DESERIALIZER
    ----------------------------------------------------------- */
    /**
     * Convert to the primitive object.
     * 
     * @return The primitive object
     */
    public toPrimitive(): Model.Primitive<this>
    {
        const ret: Record<string, any> = {};
        for (const tuple of Object.entries(this))
        {
            const key: string = tuple[0];
            const value: any = tuple[1];

            if (key[0] === "_" || key[key.length - 1] === "_")
                if (key.substr(0, 8) === "__m_enc_")
                {
                    const property: string = EncryptedColumn.getFieldByIndex(key);
                    ret[property] = (this as any)[property];
                }
                else
                    continue;
            else if (value instanceof Object)
                if (value instanceof Date)
                    ret[key] = value.toString();
                else
                    continue;
            else
                ret[key] = value;
        }

        return ret as Model.Primitive<this>;
    }
}

export namespace Model
{
    /**
     * Creator type of a model class.
     * 
     * @template T Type of the target class that is derived from the {@link Model}
     */
    export type CreatorType<T extends Model> = _CreatorType<T> & typeof Model;

    /**
     * @template T Type of a derived class from the {@link Model}
     * @return The new interface type that only pritimive properties are left
     */
    export type Primitive<T extends Model> = OmitNever<
    {
        [P in keyof T]: T[P] extends (number|string|boolean|Date|null)
            ? T[P] extends Date
                ? string
                : T[P] extends (Date|null) 
                    ? (string|null)
                    : T[P]
                : T[P];
    }>;
}