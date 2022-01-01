import {Entity, model, property} from '@loopback/repository';

@model()
export class PermisoRol extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;


  constructor(data?: Partial<PermisoRol>) {
    super(data);
  }
}

export interface PermisoRolRelations {
  // describe navigational properties here
}

export type PermisoRolWithRelations = PermisoRol & PermisoRolRelations;
