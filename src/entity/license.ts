// License generator API
// Copyright (C) 2017  Eneo Tecnología
// Author: Diego Fernández Barrera
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import config from "../config";

import { Column, Entity, PrimaryColumn } from "typeorm";

interface IInfo {
  uuid: string;
}

@Entity()
export class License {
  @PrimaryColumn("string")
  public id: string;

  // @Column()
  public info: IInfo;

  // @Column("text")
  public encoded_info: string;

  // @Column()
  public signature: string;
}
