<?php

namespace App\Tests\Integration\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class TaskControllerTest extends WebTestCase
{
    private $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    public function testGetTasks(): void
    {
        $this->client->request('GET', '/tasks');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue($responseData['success']);
        $this->assertIsArray($responseData['data']);
        $this->assertIsInt($responseData['count']);
    }

    public function testCreateTaskSuccess(): void
    {
        $taskData = [
            'title' => 'Test Task Integration',
            'description' => 'Test Description Integration',
            'priority' => 'alta',
            'category' => 'Test'
        ];

        $this->client->request(
            'POST',
            '/tasks',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($taskData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue($responseData['success']);
        $this->assertEquals('Tarefa criada com sucesso', $responseData['message']);
        $this->assertEquals($taskData['title'], $responseData['data']['title']);
    }

    public function testCreateTaskValidationError(): void
    {
        $invalidData = [
            'title' => '', // Título vazio deve gerar erro
            'priority' => 'invalid' // Prioridade inválida
        ];

        $this->client->request(
            'POST',
            '/tasks',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($invalidData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertFalse($responseData['success']);
        $this->assertIsArray($responseData['errors']);
    }

    public function testGetTaskStats(): void
    {
        $this->client->request('GET', '/tasks/stats');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('total', $responseData['data']);
        $this->assertArrayHasKey('completed', $responseData['data']);
        $this->assertArrayHasKey('pending', $responseData['data']);
        $this->assertArrayHasKey('overdue', $responseData['data']);
    }

    public function testGetCategories(): void
    {
        $this->client->request('GET', '/tasks/categories');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertTrue($responseData['success']);
        $this->assertIsArray($responseData['data']);
    }

    public function testTaskNotFound(): void
    {
        $this->client->request('GET', '/tasks/999999');

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
