import { Usuario } from './../models/usuario.model';
import { CambioClave } from './../models/cambio-clave.model';
import { Credenciales } from './../models/credenciales.model';
import { AdministradorClavesService } from './../services/administrador-claves.service';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {CredencialesRecuperarClave} from '../models';
import {UsuarioRepository} from '../repositories';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service(AdministradorClavesService)
    public servicioClaves: AdministradorClavesService
  ) {}

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {

    let clave = this.servicioClaves.CrearClaveAleatoria();
    console.log(clave)
    let claveCifrada = this.servicioClaves.CifrarTexto( clave );
    usuario.clave = claveCifrada;
    let usuarioCreado= await this.usuarioRepository.create(usuario);
      if (usuarioCreado) {
        //Enviar contraseña por email al usuario
      }
      return usuarioCreado;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**** METODOS ADICIONALES ****/

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificación de Usuarios',
    content: {'application/json': {schema: getModelSchemaRef(Credenciales)}},
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales, {
            title: 'Identificar Usuario'
          }),
        },
      },
    })
    Credenciales: Credenciales,
  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where : {
        correo: Credenciales.usuario,
        clave : Credenciales.clave
      }
    });
    if(usuario) {
      //generar token y agregarlo a la respuesta.
    }
    return usuario
  }

  @post('/cambia-clave')
  @response(200, {
    description: 'Cambio de la clave de usuario',
    content: {'application/json': {schema: getModelSchemaRef(CambioClave)}},
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CambioClave, {
          title : 'Cambiar Clave de Usuario'
          }),
        },
      },
    })
    credencialesClave: CambioClave,
  ): Promise<Boolean> {
    let respuesta = await this.servicioClaves.CambiarClave(credencialesClave);
    if(respuesta) {
      //Invocar al servicio de notificaciones para enviar correo al usuario
    }
    return false;
  }


  @post('/recuperar-clave')
  @response(200, {
    description: 'Recuperar la clave de usuario',
    content: {'application/json': {schema: {} } },
  })
  async recuperarClave(
    @requestBody({
      content: {
        'application/json': {
        },
      },
    })
    credenciales: CredencialesRecuperarClave,
    ): Promise<Usuario | null> {
      let usuario = await this.usuarioRepository.findOne({
        where: {
          correo: credenciales.correo
        }
      });
    if(usuario) {
      //Invocar al servicio de notificaciones para enviar correo al usuario
    }
    return usuario;
  }

}
