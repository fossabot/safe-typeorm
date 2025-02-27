import * as orm from "typeorm";
import { Belongs } from "../decorators/Belongs";
import { Has } from "../decorators/Has";
import { ReflectAdaptor } from "../decorators/internal/ReflectAdaptor";
import { ITableInfo } from "../functional/internal/ITableInfo";

import { Creator } from "../typings/Creator";
import { Relationship } from "../typings/Relationship";
import { SpecialFields } from "../typings/SpecialFields";

export class JoinQueryBuilder<Mine extends object>
{
    private readonly stmt_: orm.SelectQueryBuilder<any>;
    private readonly mine_: Creator<Mine>;
    private readonly alias_: string;

    public constructor(stmt: orm.SelectQueryBuilder<any>, mine: Creator<Mine>, alias?: string)
    {
        this.stmt_ = stmt;
        this.mine_ = mine;
        this.alias_ = (alias === undefined)
            ? mine.name
            : alias;
    }

    /* -----------------------------------------------------------
        RAW JOIN
    ----------------------------------------------------------- */
    public innerJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field, 
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public innerJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field, 
            alias: string,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public innerJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field, 
            alias?: string | ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void),
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>
    {
        return this._Join_atomic
        (
            (target, alias, condition) => this.stmt_.innerJoin(target, alias, condition),
            field,
            ...get_parametric_tuple(alias, closure)
        );
    }

    public leftJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public leftJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias: string,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public leftJoin<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias?: string | ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void),
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>
    {
        return this._Join_atomic
        (
            (target, alias, condition) => this.stmt_.leftJoin(target, alias, condition),
            field,
            ...get_parametric_tuple(alias, closure)
        );
    }

    private _Join_atomic<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            joiner: (target: Creator<Relationship.Atomic.TargetType<Mine, Field>>, alias: string, condition: string) => orm.SelectQueryBuilder<any>,
            field: Field,
            alias: string | undefined,
            closure: ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void) | undefined
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>
    {
        // PREPRAE ASSET
        const asset: IAsset<Mine, Field> = prepare_asset(this.mine_, field, alias);

        // LIST UP EACH FIELDS
        let myField: string;
        let targetField: string;

        if (asset.belongs === true)
        {
            // WHEN BELONGED
            myField = asset.metadata.foreign_key_field;
            targetField = get_primary_column(asset.metadata.target());
        }
        else
        {
            // WHEN HAS CHILDREN
            const inverseMetadata: Belongs.ManyToOne.IMetadata<Mine> = ReflectAdaptor.get
            (
                asset.metadata.target().prototype, 
                asset.metadata.inverse
            ) as Belongs.ManyToOne.IMetadata<Mine>;

            targetField = inverseMetadata.foreign_key_field;
            myField = get_primary_column(this.mine_);
        }

        // DO JOIN
        const condition: string = `${this.alias_}.${myField} = ${asset.alias}.${targetField}`;
        joiner(asset.metadata.target(), asset.alias, condition);

        // CALL-BACK
        return call_back(this.stmt_, asset.metadata.target(), asset.alias, closure);
    }

    /* -----------------------------------------------------------
        ORM JOIN
    ----------------------------------------------------------- */
    public innerJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public innerJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias: string,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public innerJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias?: string | ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void),
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>
    {
        return this._Join_and_select
        (
            (field, alias) => this.stmt_.innerJoinAndSelect(field, alias),
            field,
            ...get_parametric_tuple(alias, closure)
        );
    }

    public leftJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public leftJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias: string,
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>;

    public leftJoinAndSelect<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            field: Field,
            alias?: string | ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void),
            closure?: (builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void
        ): JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>
    {
        return this._Join_and_select
        (
            (field, alias) => this.stmt_.leftJoinAndSelect(field, alias), 
            field, 
            ...get_parametric_tuple(alias, closure)
        );
    }

    private _Join_and_select<Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
        (
            joiner: (field: string, alias: string) => orm.SelectQueryBuilder<any>,
            field: Field,
            alias: string | undefined,
            closure: ((builder: JoinQueryBuilder<Relationship.Atomic.TargetType<Mine, Field>>) => void) | undefined
        )
    {
        // PREPARE ASSET
        const asset: IAsset<Mine, Field> = prepare_asset(this.mine_, field, alias);
        const index: string = (asset.belongs === true)
            ? Belongs.getGetterField<any>(field)
            : Has.getGetterField(field);

        // DO JOIN
        joiner(`${this.alias_}.${index}`, asset.alias);

        // CALL-BACK
        return call_back(this.stmt_, asset.metadata.target(), asset.alias, closure);
    }
}

/* -----------------------------------------------------------
    BACKGROUND
----------------------------------------------------------- */
type IAsset<
        Mine extends object, 
        Field extends SpecialFields<Mine, Relationship.Atomic<any>>> =
{
    belongs: true;
    alias: string;
    metadata: Belongs.ManyToOne.IMetadata<Relationship.Atomic.TargetType<Mine, Field>>;
} | 
{
    belongs: false;
    alias: string;
    metadata: Has.OneToMany.IMetadata<Relationship.Atomic.TargetType<Mine, Field>>;
};

function prepare_asset<
        Mine extends object, 
        Field extends SpecialFields<Mine, Relationship.Atomic<any>>>
    (
        mine: Creator<Mine>,
        field: Field,
        alias: string | undefined
    ): IAsset<Mine, Field>
{
    const metadata: ReflectAdaptor.Metadata<Relationship.Atomic.TargetType<Mine, Field>> = ReflectAdaptor.get(mine.prototype, field)!;
    const belongs: boolean = metadata.type.indexOf("Belongs.") === 0;

    // DETERMINE THE ALIAS
    if (alias === undefined)
        alias = metadata.target().name;
    
    // RETURNS
    return { 
        belongs: belongs as true, 
        metadata: metadata as Belongs.ManyToOne.IMetadata<Relationship.Atomic.TargetType<Mine, Field>>,
        alias, 
    };
}

function call_back<Target extends object>
    (
        stmt: orm.SelectQueryBuilder<any>, 
        target: Creator<Target>, 
        alias: string,
        closure: ((builder: JoinQueryBuilder<Target>) => void) | undefined
    ): JoinQueryBuilder<Target>
{
    const ret: JoinQueryBuilder<Target> = new JoinQueryBuilder(stmt, target, alias);
    if (closure !== undefined)
        closure(ret);
    return ret;
}

function get_parametric_tuple<Func extends Function>
    (x?: string | Func, y?: Func): [string|undefined, Func|undefined]
{
    return (typeof x === "string")
        ? [x, y]
        : [undefined, x];
}

function get_primary_column(creator: Creator<object>): string
{
    return ITableInfo.get(creator).primaryColumn;
}