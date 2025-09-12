import { Injectable } from '@angular/core';
import { format, parse, addMinutes, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  constructor() { }

  /**
   * Formatea una fecha con el formato especificado
   * @param date - Fecha a formatear (Date, string o number)
   * @param formatStr - Formato de salida (por defecto: 'dd/MM/yyyy')
   * @returns Fecha formateada como string
   */
  formatDate(date: Date | string | number, formatStr = 'dd/MM/yyyy'): string {
    try {
      const dateObj = this.parseDate(date);
      return format(dateObj, formatStr, { locale: es });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  }

  /**
   * Obtiene la fecha actual formateada
   * @param formatStr - Formato de salida
   * @returns Fecha actual formateada
   */
  getCurrentDate(formatStr = 'yyyy-MM-dd'): string {
    return format(new Date(), formatStr, { locale: es });
  }

  /**
   * Obtiene la fecha y hora actual formateada
   * @param formatStr - Formato de salida
   * @returns Fecha y hora actual formateada
   */
  getCurrentDateTime(formatStr = 'yy-MM-dd HH:mm:ss'): string {
    return format(new Date(), formatStr, { locale: es });
  }

  /**
   * Parsea una fecha desde string o número a objeto Date
   * @param date - Fecha a parsear
   * @returns Objeto Date
   */
  parseDate(date: Date | string | number): Date {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      // Si es un string con formato específico
      if (date.includes('-') && date.length === 10) {
        return parse(date, 'yyyy-MM-dd', new Date());
      }
      return new Date(date);
    }

    if (typeof date === 'number') {
      return new Date(date);
    }

    return new Date();
  }

  /**
   * Agrega minutos a una fecha
   * @param date - Fecha base
   * @param minutes - Minutos a agregar
   * @returns Nueva fecha con minutos agregados
   */
  addMinutesToDate(date: Date | string, minutes: number): Date {
    const dateObj = this.parseDate(date);
    return addMinutes(dateObj, minutes);
  }

  /**
   * Formatea una fecha específica con formato YY-MM-DD HH:mm:ss
   * @param date - Fecha a formatear
   * @returns Fecha formateada
   */
  formatToCustomDateTime(date: Date | string): string {
    return this.formatDate(date, 'yy-MM-dd HH:mm:ss');
  }

  /**
   * Formatea una fecha específica con formato YYYY-MM-DD
   * @param date - Fecha a formatear
   * @returns Fecha formateada
   */
  formatToISODate(date: Date | string): string {
    return this.formatDate(date, 'yyyy-MM-dd');
  }

  /**
   * Crea una fecha mínima (0000-01-01)
   * @returns Fecha mínima formateada
   */
  getMinDate(): string {
    return '0001-01-01';
  }

  /**
   * Valida si una fecha es válida
   * @param date - Fecha a validar
   * @returns true si es válida, false si no
   */
  isValidDate(date: any): boolean {
    try {
      const dateObj = this.parseDate(date);
      return isValid(dateObj);
    } catch {
      return false;
    }
  }
}